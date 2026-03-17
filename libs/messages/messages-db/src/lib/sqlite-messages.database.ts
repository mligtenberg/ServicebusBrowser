import { MessagesDatabase } from './messages-database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Database } from './sqllite/database';
import {
  ensureMessagesDbCreated,
} from './sqllite/ensure-db-created';
import { getWhereClause } from './filter-to-where-clause';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import { BSON } from 'bson';
import { MessageFilter } from '@service-bus-browser/filtering';

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
    await ensureMessagesDbCreated(this.database);
  }

  async addMessages(messages: ReceivedMessage[]): Promise<void> {
    if (!messages.length) {
      return;
    }

    const foundSystemLabels = new Set<string>();
    const foundApplicationLabels = new Set<string>();

    const knownSystemPropertyNames = await this.selectRows<[string]>(
      "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'system' AND propertyType <> 'null'",
    );
    const knownApplicationPropertyNames = await this.selectRows<[string]>(
      "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'application' AND propertyType <> 'null'",
    );

    for (const propertyName of knownSystemPropertyNames.flat()) {
      foundSystemLabels.add(propertyName);
    }

    for (const propertyName of knownApplicationPropertyNames.flat()) {
      foundApplicationLabels.add(propertyName);
    }

    await this.database.exec('BEGIN TRANSACTION');
    try {
      for (const message of messages) {
        const messageBson = BSON.serialize(message);
        const body = new TextDecoder().decode(message.body);

        await this.database.exec(
          `INSERT OR REPLACE INTO messages (
            id,
            contentType,
            sequence,
            body,
            message
          ) VALUES (?, ?, ? ,?, ?)`,
          [
            message.key,
            message.contentType,
            message.sequence,
            body,
            this.toBase64(messageBson),
          ],
        );

        await this.database.exec(
          'DELETE FROM applicationProperties WHERE messageId = ?',
          [message.key],
        );

        const systemProperties = message.systemProperties ?? {};
        for (const [propertyName, propertyValue] of Object.entries(
          systemProperties,
        )) {
          await this.database.exec(
            `INSERT OR REPLACE INTO systemProperties (
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

        const systemPropertiesLabels = Object.keys(systemProperties);
        for (const label of systemPropertiesLabels) {
          if (foundSystemLabels.has(label)) {
            continue;
          }

          const propertyType = this.getPropertyType(systemProperties[label]);
          await this.database.exec(
            `INSERT OR REPLACE INTO propertyLabels (
              propertyName,
              propertyType,
              propertyLocation
            ) VALUES (?, ?, ?)`,
            [label, propertyType, 'system'],
          );

          // only add the label if we already know the property type
          if (propertyType !== 'null') {
            foundSystemLabels.add(label);
          }
        }

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

        const applicationLabels = Object.keys(applicationProperties);
        for (const label of applicationLabels) {
          if (foundApplicationLabels.has(label)) {
            continue;
          }

          const propertyType = this.getPropertyType(
            applicationProperties[label],
          );
          await this.database.exec(
            `INSERT OR REPLACE INTO propertyLabels (
              propertyName,
              propertyType,
              propertyLocation
            ) VALUES (?, ?, ?)`,
            [label, propertyType, 'application'],
          );

          // only add the label if we already know the property type
          if (propertyType !== 'null') {
            foundApplicationLabels.add(label);
          }
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
    selectionKeys?: string[],
  ): Promise<number> {
    const whereClause = getWhereClause(filter, selectionKeys);

    const result = await this.selectRows<{ count: number }>(
      `SELECT COUNT(*) as count FROM messages ${whereClause.clause}`,
      whereClause.args ?? [],
    );

    return Number(result[0] ?? 0);
  }

  async deleteDatabase(): Promise<void> {
    await this.database.destroy();
  }

  async getSystemPropertyLabels(): Promise<{ label: string; type: string }[]> {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'system' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getApplicationPropertyLabels(): Promise<
    { label: string; type: string }[]
  > {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'application' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getMessage(key: string): Promise<ReceivedMessage | undefined> {
    const rows = await this.selectRows<[Uint8Array]>(
      'SELECT message FROM messages WHERE id = ? LIMIT 1',
      [key],
    );
    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return BSON.deserialize(this.fromBase64(row[0] as any)) as ReceivedMessage;
  }

  async getMessages(
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selectionKeys?: string[],
  ): Promise<ReceivedMessage[]> {
    return await this.loadMessages(
      ascending ?? true,
      filter,
      selectionKeys,
      skip,
      take,
    );
  }

  async walkMessagesWithCallback(
    callback: (message: ReceivedMessage, index: number) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selectionKeys: string[] = [],
  ): Promise<void> {
    if (take === 0) {
      return;
    }

    const maxPageSize = 300;

    let index = 0;
    let messages = await this.loadMessages(
      ascending ?? true,
      filter,
      selectionKeys,
      skip,
      maxPageSize,
    );
    while (messages.length > 0) {
      // seeing that we use a callback, we can't guarantee that the message content will be reserved
      const lastMessageKey = messages[messages.length - 1].key;

      for (const message of messages) {
        const result = callback(message, index++);
        if (result instanceof Promise) {
          await result;
        }
      }

      messages = await this.loadMessages(
        ascending ?? true,
        filter,
        selectionKeys,
        undefined,
        maxPageSize,
        lastMessageKey,
      );
    }
  }

  private async loadMessages(
    ascending: boolean,
    filter?: MessageFilter,
    selectionKeys?: string[],
    skip?: number,
    take?: number,
    fromKey?: string,
  ): Promise<ReceivedMessage[]> {
    if (take === 0) {
      return [];
    }

    const whereClause = getWhereClause(filter, selectionKeys);
    let sql = `SELECT message FROM messages`;

    let args: unknown[] = [];
    if (whereClause.clause) {
      sql += ` ${whereClause.clause}`;
      args = whereClause.args ?? [];
    }

    if (fromKey) {
      if (whereClause.clause) {
        sql += ` AND id > ?`;
      } else {
        sql += ` WHERE id > ?`;
      }
      args = [...args, fromKey];
    }

    sql += ` ORDER BY id ${ascending ? 'ASC' : 'DESC'}`;

    if (take) {
      sql += ` LIMIT ${take}`;
    }

    if (skip) {
      sql += ` OFFSET ${skip}`;
    }

    const rows = await this.selectRows<[Uint8Array]>(sql, args);

    if (!rows.length) {
      return [];
    }

    return rows
      .map((row) => {
        try {
          return BSON.deserialize(
            this.fromBase64(row[0] as any),
          ) as ReceivedMessage;
        } catch (error) {
          console.error('Error parsing message from database:', error);
          return null;
        }
      })
      .filter((message) => message !== null);
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

  private toBase64(value: Uint8Array): string {
    return (value as any).toBase64();
  }

  private fromBase64(value: string): Uint8Array {
    return (Uint8Array as any).fromBase64(value);
  }
}
