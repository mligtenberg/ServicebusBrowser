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
import { getWhereClause } from './filter-to-where-clause';

export class SqliteMessagesDatabase implements MessagesDatabase {
  private readonly database: Database;
  private initializePromise?: Promise<void>;
  constructor(pageId: UUID) {
    this.database = new Database(pageId);
  }

  async initialize(): Promise<void> {
    if (this.initializePromise) {
      await this.initializePromise;
      return;
    }

    this.initializePromise = this.doInitialize();
    await this.initializePromise;
  }

  private async doInitialize(): Promise<void> {
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
        await this.database.exec(
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
            messageTo,
            message
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            JSON.stringify(message),
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
    const whereClause = getWhereClause(filter, selection);

    const result = await this.selectRows<{ count: number }>(
      `SELECT COUNT(*) as count FROM messages ${whereClause.clause}`,
      whereClause.args ?? [],
    );

    return Number(result[0] ?? 0);
  }

  async deleteDatabase(): Promise<void> {
    await this.database.destroy();
  }

  async getMessage(
    sequenceNumber: string,
  ): Promise<ServiceBusReceivedMessage | undefined> {
    const keyCandidates = this.toKeyCandidates(sequenceNumber);
    for (const key of keyCandidates) {
      const rows = await this.selectRows<{message: string}>(
        'SELECT message FROM messages WHERE id = ? LIMIT 1',
        [key],
      );
      const row = rows[0];
      if (!row) {
        continue;
      }

      return JSON.parse(row.message) as ServiceBusReceivedMessage;
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
    return await this.loadMessages(ascending ?? true, filter, selection, skip, take);
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
    selection: string[] = [],
  ): Promise<void> {
    if (take === 0) {
      return;
    }

    const effectiveAscending = ascending ?? true;
    const allMessages = await this.loadMessages(
      effectiveAscending,
      filter,
      selection,
      skip,
      take,
  );

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
    filter?: MessageFilter,
    selection?: string[],
    skip?: number,
    take?: number,
  ): Promise<ServiceBusReceivedMessage[]> {
    if (take === 0) {
      return [];
    }

    const whereClause = getWhereClause(filter, selection);
    let sql = `SELECT message FROM messages`;

    if (whereClause.clause) {
      sql += ` ${whereClause.clause}`;
    }

    sql += ` ORDER BY id ${ascending ? 'ASC' : 'DESC'}`;

    if (take) {
      sql += ` LIMIT ${take}`;
    }

    if (skip) {
      sql += ` OFFSET ${skip}`;
    }

    const rows = await this.selectRows<[string]>(
      sql,
      whereClause.args ?? [],
    );

    if (!rows.length) {
      return [];
    }

    return rows.map((row) => JSON.parse(row[0]) as ServiceBusReceivedMessage);
  }

  private serializeBody(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  }

  private serializeDate(value?: Date): string | null {
    return value ? value.toISOString() : null;
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
