import { MessagesDatabase } from './messages-database';
import {
  MessageFilter,
  sequenceNumberToKey,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Database } from './sqllite/database';
import { ensureCreated } from './sqllite/ensure-created';
import { messageInFilter } from '@service-bus-browser/filtering';
import { isFilterEmpty } from './repo-helpers';

export class SqliteMessagesDatabase implements MessagesDatabase {
  private readonly database: Database;
  constructor(pageId: UUID) {
    this.database = new Database(pageId);
  }

  async initialize(): Promise<void> {
    await this.database.initialize();
    await ensureCreated(this.database);
  }

  async addMessages(messages: ServiceBusReceivedMessage[]): Promise<void> {
    if (!messages.length) {
      return;
    }

    await this.database.exec('BEGIN TRANSACTION');
    try {
      for (const message of messages) {
        const messagesResult = await this.database.exec(
          `INSERT OR REPLACE INTO messages (
            id,
            body,
            contentType,
            correlationId,
            deadLetterErrorDescription,
            deadLetterReason,
            deadLetterSource,
            deliveryCount,
            enqueuedSequenceNumber,
            enqueuedTimeUtc,
            expiresAtUtc,
            lockToken,
            lockedUntilUtc,
            messageId,
            partitionKey,
            replyTo,
            replyToSessionId,
            scheduledEnqueueTimeUtc,
            sequenceNumber,
            sessionId,
            messageState,
            subject,
            timeToLive,
            messageTo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.key,
            this.serializeBody(message.body),
            message.contentType ?? null,
            message.correlationId ?? null,
            message.deadLetterErrorDescription ?? null,
            message.deadLetterReason ?? null,
            message.deadLetterSource ?? null,
            message.deliveryCount ?? null,
            message.enqueuedSequenceNumber ?? null,
            this.serializeDate(message.enqueuedTimeUtc),
            this.serializeDate(message.expiresAtUtc),
            message.lockToken ?? null,
            this.serializeDate(message.lockedUntilUtc),
            message.messageId ?? null,
            message.partitionKey ?? null,
            message.replyTo ?? null,
            message.replyToSessionId ?? null,
            this.serializeDate(message.scheduledEnqueueTimeUtc),
            message.sequenceNumber ?? null,
            message.sessionId ?? null,
            message.state ?? 'active',
            message.subject ?? null,
            message.timeToLive ?? null,
            message.to ?? null,
          ],
        );

        await this.database.exec(
          'DELETE FROM applicationProperties WHERE messageId = ?',
          [message.key],
        );

        const applicationProperties = message.applicationProperties ?? {};
        for (const [propertyName, propertyValue] of Object.entries(
          applicationProperties,
        )) {
          await this.database.exec(
            `INSERT OR REPLACE INTO applicationProperties (
              messageId,
              propertyName,
              propertyType,
              propertyValue
            ) VALUES (?, ?, ?, ?)`,
            [
              message.key,
              propertyName,
              this.getPropertyType(propertyValue),
              this.serializePropertyValue(propertyValue),
            ],
          );
        }
      }

      await this.database.exec('COMMIT');
    } catch (error) {
      await this.database.exec('ROLLBACK');
      throw error;
    }
  }

  async countMessages(
    filter?: MessageFilter,
    selection?: string[],
  ): Promise<number> {
    if ((!filter || isFilterEmpty(filter)) && !selection?.length) {
      const result = await this.selectRows<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages',
      );
      return Number(result[0]?.count ?? 0);
    }

    const messages = await this.getMessages(
      filter,
      undefined,
      undefined,
      true,
      selection,
    );
    return messages.length;
  }

  async deleteDatabase(): Promise<void> {
    await this.database.destroy();
  }

  async getMessage(
    sequenceNumber: string,
  ): Promise<ServiceBusReceivedMessage | undefined> {
    const keyCandidates = this.toKeyCandidates(sequenceNumber);
    for (const key of keyCandidates) {
      const rows = await this.selectRows<SqlMessageRow>(
        'SELECT * FROM messages WHERE id = ? LIMIT 1',
        [key],
      );
      const row = rows[0];
      if (!row) {
        continue;
      }

      const applicationProperties =
        await this.getApplicationPropertiesForMessage(row.id);
      return this.toServiceBusMessage(row, applicationProperties);
    }

    return undefined;
  }

  async getMessages(
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ): Promise<ServiceBusReceivedMessage[]> {
    const messages: ServiceBusReceivedMessage[] = [];
    await this.walkMessagesWithCallback(
      (message) => {
        messages.push(message);
      },
      filter,
      skip,
      take,
      ascending,
      selection,
    );
    return messages;
  }

  async walkMessagesWithCallback(
    callback: (
      message: ServiceBusReceivedMessage,
      index: number,
    ) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ): Promise<void> {
    if (take === 0) {
      return;
    }

    const effectiveAscending = ascending ?? true;
    const allMessages = await this.loadMessages(effectiveAscending, selection);

    let walked = 0;
    let currentIndex = 0;
    for (const message of allMessages) {
      if (filter && !messageInFilter(message, filter)) {
        continue;
      }

      walked++;
      if (skip && walked <= skip) {
        continue;
      }

      if (take && walked > (skip ?? 0) + take) {
        break;
      }

      const result = callback(message, currentIndex);
      currentIndex++;
      if (result instanceof Promise) {
        await result;
      }
    }
  }

  private async loadMessages(
    ascending: boolean,
    selection?: string[],
  ): Promise<ServiceBusReceivedMessage[]> {
    if (selection?.length) {
      const resolvedMessages: ServiceBusReceivedMessage[] = [];
      const sortedKeys = selection
        .flatMap((value) => this.toKeyCandidates(value))
        .filter((key, index, array) => array.indexOf(key) === index)
        .sort((left, right) =>
          ascending ? left.localeCompare(right) : right.localeCompare(left),
        );

      for (const key of sortedKeys) {
        const message = await this.getMessage(key);
        if (message) {
          resolvedMessages.push(message);
        }
      }

      return resolvedMessages;
    }

    const rows = await this.selectRows<SqlMessageRow>(
      `SELECT * FROM messages ORDER BY id ${ascending ? 'ASC' : 'DESC'}`,
    );
    if (!rows.length) {
      return [];
    }

    const applicationPropertiesRows =
      await this.selectRows<SqlApplicationPropertyRow>(
        'SELECT * FROM applicationProperties',
      );

    const propertiesByMessageId = new Map<
      string,
      Record<string, string | number | boolean | Date | null>
    >();
    for (const property of applicationPropertiesRows) {
      const messageProperties =
        propertiesByMessageId.get(property.messageId) ?? {};
      messageProperties[property.propertyName] = this.deserializePropertyValue(
        property.propertyType,
        property.propertyValue,
      );
      propertiesByMessageId.set(property.messageId, messageProperties);
    }

    return rows.map((row) =>
      this.toServiceBusMessage(row, propertiesByMessageId.get(row.id) ?? {}),
    );
  }

  private async getApplicationPropertiesForMessage(messageId: string) {
    const rows = await this.selectRows<SqlApplicationPropertyRow>(
      'SELECT * FROM applicationProperties WHERE messageId = ?',
      [messageId],
    );

    const applicationProperties: Record<
      string,
      string | number | boolean | Date | null
    > = {};
    for (const row of rows) {
      applicationProperties[row.propertyName] = this.deserializePropertyValue(
        row.propertyType,
        row.propertyValue,
      );
    }

    return applicationProperties;
  }

  private toServiceBusMessage(
    row: SqlMessageRow,
    applicationProperties: Record<
      string,
      string | number | boolean | Date | null
    >,
  ): ServiceBusReceivedMessage {
    return {
      key: row.id,
      body: this.deserializeBody(row.body),
      contentType: row.contentType ?? undefined,
      correlationId: row.correlationId ?? undefined,
      deadLetterErrorDescription: row.deadLetterErrorDescription ?? undefined,
      deadLetterReason: row.deadLetterReason ?? undefined,
      deadLetterSource: row.deadLetterSource ?? undefined,
      deliveryCount: row.deliveryCount ?? undefined,
      enqueuedSequenceNumber: row.enqueuedSequenceNumber ?? undefined,
      enqueuedTimeUtc: this.deserializeDate(row.enqueuedTimeUtc),
      expiresAtUtc: this.deserializeDate(row.expiresAtUtc),
      lockToken: row.lockToken ?? undefined,
      lockedUntilUtc: this.deserializeDate(row.lockedUntilUtc),
      messageId: row.messageId ?? undefined,
      partitionKey: row.partitionKey ?? undefined,
      replyTo: row.replyTo ?? undefined,
      replyToSessionId: row.replyToSessionId ?? undefined,
      scheduledEnqueueTimeUtc: this.deserializeDate(
        row.scheduledEnqueueTimeUtc,
      ),
      sequenceNumber: row.sequenceNumber ?? undefined,
      sessionId: row.sessionId ?? undefined,
      state:
        (row.messageState as ServiceBusReceivedMessage['state']) ?? 'active',
      subject: row.subject ?? undefined,
      timeToLive: row.timeToLive ?? undefined,
      to: row.messageTo ?? undefined,
      applicationProperties,
    };
  }

  private serializeBody(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  }

  private deserializeBody(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private serializeDate(value?: Date): string | null {
    return value ? value.toISOString() : null;
  }

  private deserializeDate(value?: string | null): Date | undefined {
    if (!value) {
      return undefined;
    }
    return new Date(value);
  }

  private getPropertyType(value: unknown): string {
    if (value === null) {
      return 'null';
    }
    if (value instanceof Date) {
      return 'date';
    }

    return typeof value;
  }

  private serializePropertyValue(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private deserializePropertyValue(
    type: string,
    value: string | null,
  ): string | number | boolean | Date | null {
    if (value === null) {
      return null;
    }

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'date':
        return new Date(value);
      case 'null':
        return null;
      default:
        return value;
    }
  }

  private async selectRows<T>(sql: string, args: unknown[] = []): Promise<T[]> {
    const response = await this.database.exec(sql, args);
    const responseAsRecord = response as {
      result?: { resultRows?: unknown[] };
      resultRows?: unknown[];
    };

    const rows =
      responseAsRecord.result?.resultRows ?? responseAsRecord.resultRows;
    return (rows ?? []) as T[];
  }

  private toKeyCandidates(value: string): string[] {
    const normalized = value.trim();
    if (/^\d+$/.test(normalized)) {
      return [sequenceNumberToKey(normalized), normalized];
    }

    return [normalized];
  }
}

type SqlMessageRow = {
  id: string;
  body: string;
  contentType: string | null;
  correlationId: string | null;
  deadLetterErrorDescription: string | null;
  deadLetterReason: string | null;
  deadLetterSource: string | null;
  deliveryCount: number | null;
  enqueuedSequenceNumber: number | null;
  enqueuedTimeUtc: string | null;
  expiresAtUtc: string | null;
  lockToken: string | null;
  lockedUntilUtc: string | null;
  messageId: string | null;
  partitionKey: string | null;
  replyTo: string | null;
  replyToSessionId: string | null;
  scheduledEnqueueTimeUtc: string | null;
  sequenceNumber: string | null;
  sessionId: string | null;
  messageState: string | null;
  subject: string | null;
  timeToLive: string | null;
  messageTo: string | null;
};

type SqlApplicationPropertyRow = {
  messageId: string;
  propertyName: string;
  propertyType: string;
  propertyValue: string | null;
};
