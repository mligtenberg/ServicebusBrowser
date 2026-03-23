import { MessagesDatabase } from './messages-database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Database } from './sqllite/database';
import { ensureMessagesDbCreated } from './sqllite/ensure-db-created';
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

    const knownHeaderPropertyNames = (
      await this.selectRows<[string]>(
        "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'headers' AND propertyType <> 'null'",
      )
    ).flat();
    const knownPropertiesPropertyNames = (
      await this.selectRows<[string]>(
        "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'properties' AND propertyType <> 'null'",
      )
    ).flat();
    const knownDeliveryAnnotationsPropertyNames = (
      await this.selectRows<[string]>(
        "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'deliveryAnnotations' AND propertyType <> 'null'",
      )
    ).flat();
    const knownMessageAnnotationsPropertyNames = (
      await this.selectRows<[string]>(
        "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'messageAnnotations' AND propertyType <> 'null'",
      )
    ).flat();
    const knownApplicationPropertyNames = (
      await this.selectRows<[string]>(
        "SELECT propertyName FROM propertyLabels WHERE propertyLocation = 'applicationProperties' AND propertyType <> 'null'",
      )
    ).flat();

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

        const insertProperties = async (
          properties: Record<string, unknown>,
          tableName: string,
          knownLabels: string[],
        ) => {
          const foundLabels = new Set<string>(knownLabels);

          for (const [propertyName, propertyValue] of Object.entries(
            properties,
          )) {
            await this.database.exec(
              `INSERT OR REPLACE INTO ${tableName} (
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

          const propertiesLabels = Object.keys(properties);
          for (const label of propertiesLabels) {
            if (foundLabels.has(label)) {
              continue;
            }

            const propertyType = this.getPropertyType(properties[label]);
            await this.database.exec(
              `INSERT OR REPLACE INTO propertyLabels (
              propertyName,
              propertyType,
              propertyLocation
            ) VALUES (?, ?, ?)`,
              [label, propertyType, tableName],
            );

            // only add the label if we already know the property type
            if (propertyType !== 'null') {
              foundLabels.add(label);
            }
          }
        };

        await insertProperties(
          message.headers ?? {},
          'headers',
          knownHeaderPropertyNames,
        );
        await insertProperties(
          message.applicationProperties ?? {},
          'applicationProperties',
          knownApplicationPropertyNames,
        );
        await insertProperties(
          message.properties ?? {},
          'properties',
          knownPropertiesPropertyNames,
        );
        await insertProperties(
          message.deliveryAnnotations ?? {},
          'deliveryAnnotations',
          knownDeliveryAnnotationsPropertyNames,
        );
        await insertProperties(
          message.messageAnnotations ?? {},
          'messageAnnotations',
          knownMessageAnnotationsPropertyNames,
        );
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

  async getHeaderPropertyLabels(): Promise<{ label: string; type: string }[]> {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'headers' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getPropertiesPropertyLabels(): Promise<
    { label: string; type: string }[]
  > {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'properties' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getDeliveryAnnotationsPropertyLabels(): Promise<
    { label: string; type: string }[]
  > {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'deliveryAnnotations' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getMessageAnnotationsPropertyLabels(): Promise<
    { label: string; type: string }[]
  > {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'messageAnnotations' AND propertyType <> 'null'",
    );
    return rows.map(([label, type]) => ({ label, type }));
  }

  async getApplicationPropertyLabels(): Promise<
    { label: string; type: string }[]
  > {
    const rows = await this.selectRows<[string, string]>(
      "SELECT propertyName, propertyType FROM propertyLabels WHERE propertyLocation = 'applicationProperties' AND propertyType <> 'null'",
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
          return null;
        }
      })
      .filter((message) => message !== null)
      .map((message) => ({
        ...message,
        body: message.body.buffer as any as Uint8Array,
      }));
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
