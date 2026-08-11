import { MessagesDatabase } from './messages-database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Database } from './sqllite/database';
import { ensureMessagesDbCreated } from './sqllite/ensure-db-created';
import { getWhereClause } from './filter-to-where-clause';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import { BSON } from 'bson';
import { MessageFilter } from '@service-bus-browser/filtering';
import {
  buildFilterIndexCountQuery,
  buildFilterIndexPageQuery,
  buildFilterIndexStatements,
  filterIndexSignature,
} from './filter-index-sql';

export class SqliteMessagesDatabase implements MessagesDatabase {
  private readonly database: Database;
  private initializePromise?: Promise<void>;

  /** Signature of the filter index currently materialized on this connection. */
  private filterIndexSignature?: string;
  /** Row count of that index, i.e. the filtered message count. */
  private filterIndexCount = 0;
  /** Serializes builds and reads — there is only one index table. */
  private filterIndexQueue: Promise<void> = Promise.resolve();
  /** Bumped on every write, to invalidate the filter index. */
  private messagesVersion = 0;

  constructor(pageId: UUID, workspaceId: UUID) {
    this.database = new Database(`${workspaceId}/${pageId}`);
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

    // The filter index lives in temp storage; keep it in memory so it never
    // needs a temp *file*, which the OPFS VFS has no place to put.
    await this.database.exec('PRAGMA temp_store = MEMORY');
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
      this.messagesVersion++;
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

    if (!whereClause.clause) {
      const result = await this.selectRows<{ count: number }>(
        `SELECT COUNT(*) as count FROM messages`,
      );
      return Number(result[0] ?? 0);
    }

    // Counting a filtered set costs a full scan either way, so pay it once by
    // building the index the paged reads then seek into.
    return await this.withFilterIndex(
      whereClause,
      filter,
      selectionKeys,
      async (total) => total,
    );
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

  async getVisibleColumns(): Promise<string[] | null> {
    const rows = await this.selectRows<[string]>(
      "SELECT settingValue FROM settings WHERE settingKey = 'visibleColumns' LIMIT 1",
    );
    const raw = rows[0]?.[0];
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.every((f) => typeof f === 'string')
      ) {
        return parsed;
      }
    } catch {
      // ignore parse errors and fall through
    }
    return null;
  }

  async setVisibleColumns(fields: string[]): Promise<void> {
    await this.database.exec(
      `INSERT OR REPLACE INTO settings (settingKey, settingValue) VALUES (?, ?)`,
      ['visibleColumns', JSON.stringify(fields)],
    );
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

    const decoded = BSON.deserialize(this.fromBase64(row[0] as any));
    return {
      ...decoded,
      body: decoded['body'].buffer as any as Uint8Array,
    } as ReceivedMessage;
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

    // Random access into a *filtered* result set cannot use LIMIT/OFFSET:
    // SQLite has to re-evaluate the predicate over every skipped row, so the
    // cost grows with the offset — seconds per page beyond ~30k rows on a
    // 700k-message page, which left the grid's rows blank. Seek into the
    // materialized filter index instead. See docs/filtered-paging.md.
    if (whereClause.clause && !fromKey) {
      return await this.withFilterIndex(
        whereClause,
        filter,
        selectionKeys,
        async (total) => {
          const pageQuery = buildFilterIndexPageQuery({
            skip,
            take,
            ascending,
            total,
          });
          return this.decodeMessages(
            await this.selectRows<[Uint8Array]>(pageQuery.sql, pageQuery.args),
          );
        },
      );
    }

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

    return this.decodeMessages(
      await this.selectRows<[Uint8Array]>(sql, args),
    );
  }

  private decodeMessages(rows: Array<[Uint8Array]>): ReceivedMessage[] {
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

  /**
   * Materializes (or reuses) the ordered id list for `whereClause` and returns
   * its row count. Concurrent callers — the count query and the grid's page
   * reads land together on every filter change — share one build rather than
   * each paying for a full scan.
   */
  private withFilterIndex<T>(
    whereClause: ReturnType<typeof getWhereClause>,
    filter: MessageFilter | undefined,
    selectionKeys: string[] | undefined,
    read: (total: number) => Promise<T>,
  ): Promise<T> {
    const signature = filterIndexSignature({
      filter,
      selectionKeys,
      messagesVersion: this.messagesVersion,
    });

    // Serialized: only one filter's index exists at a time, so neither a build
    // nor a read against it may interleave with another filter's build.
    return this.enqueueFilterIndexWork(async () => {
      if (this.filterIndexSignature !== signature) {
        this.filterIndexSignature = undefined;
        for (const statement of buildFilterIndexStatements(whereClause)) {
          await this.database.exec(statement.sql, statement.args);
        }
        // Counted once per build: the index cannot change while its signature
        // holds, and a COUNT(*) over it is O(matches) — not something to repeat
        // for every 100-row window the grid asks for.
        const counted = await this.selectRows<[number]>(
          buildFilterIndexCountQuery(),
        );
        this.filterIndexCount = Number(counted[0] ?? 0);
        this.filterIndexSignature = signature;
      }

      return await read(this.filterIndexCount);
    });
  }

  private enqueueFilterIndexWork<T>(work: () => Promise<T>): Promise<T> {
    const result = this.filterIndexQueue.then(work, work);
    this.filterIndexQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
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
