import { UUID } from '@service-bus-browser/shared-contracts';
import { MessagesRepository } from './messages-repository';
import { withReadOnlyMessagePage } from './readonly-query';

export interface TableColumn {
  name: string;
  type: string;
  primaryKey: boolean;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
}

export interface MessagePageSchema {
  /**
   * Every table in the page's SQLite file, with its real columns —
   * introspected via `PRAGMA table_info` rather than hand-maintained, so it
   * can't drift from the actual schema (as a hand-maintained column list
   * once did: it was missing `messages.message`, an internal BSON blob).
   */
  tables: TableSchema[];
  /**
   * Property tables (`headers`, `properties`, `deliveryAnnotations`,
   * `messageAnnotations`, `applicationProperties`) are EAV-shaped —
   * `messageId, propertyName, propertyType, propertyValue`, joined to
   * `messages.id` — so their *interesting* column, `propertyName`, doesn't
   * show up as a column at all. `labels` lists the property names/types
   * actually seen on this page, e.g. to look up a header's
   * `propertyValue` you'd join on `propertyName = '<label>'`.
   */
  propertyTables: {
    table: string;
    labels: { label: string; type: string }[];
  }[];
  /** A worked example joining a property table, since the EAV shape above trips up naive column-name guesses. */
  exampleQuery: string;
}

async function getTableSchemas(
  workspaceId: UUID,
  pageId: UUID,
): Promise<TableSchema[]> {
  // One shared connection, queried sequentially: opening a separate
  // connection per table (or running these in parallel) means several
  // concurrent opens against the same OPFS file — a direct path to
  // `SQLITE_BUSY: database is locked`, on top of whatever connection the
  // visible app window already holds open to it.
  return withReadOnlyMessagePage(workspaceId, pageId, async (query) => {
    const { rows: tableRows } = await query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    const tableNames = tableRows.map((row) => row[0] as string);

    const tables: TableSchema[] = [];
    for (const name of tableNames) {
      const { rows } = await query(`PRAGMA table_info("${name}")`);
      tables.push({
        name,
        // PRAGMA table_info rows: [cid, name, type, notnull, dflt_value, pk]
        columns: rows.map((row) => ({
          name: row[1] as string,
          type: row[2] as string,
          primaryKey: Boolean(row[5]),
        })),
      });
    }
    return tables;
  });
}

/**
 * Describes a Message Page's full queryable SQL shape (ADR-0012) for the
 * `query_message_page` MCP tool: every table's real columns, plus each
 * property table's known labels/types actually seen on this page — the
 * latter can't come from schema introspection alone, since it's data
 * (which `propertyName`s exist), not schema.
 */
export async function describeMessagePage(
  repository: MessagesRepository,
  workspaceId: UUID,
  pageId: UUID,
): Promise<MessagePageSchema> {
  const [
    tables,
    headers,
    properties,
    deliveryAnnotations,
    messageAnnotations,
    applicationProperties,
  ] = await Promise.all([
    getTableSchemas(workspaceId, pageId),
    repository.getHeaderPropertyLabels(pageId),
    repository.getPropertiesPropertyLabels(pageId),
    repository.getDeliveryAnnotationsPropertyLabels(pageId),
    repository.getMessageAnnotationsPropertyLabels(pageId),
    repository.getApplicationPropertyLabels(pageId),
  ]);

  return {
    tables,
    propertyTables: [
      { table: 'headers', labels: headers },
      { table: 'properties', labels: properties },
      { table: 'deliveryAnnotations', labels: deliveryAnnotations },
      { table: 'messageAnnotations', labels: messageAnnotations },
      { table: 'applicationProperties', labels: applicationProperties },
    ],
    exampleQuery:
      "SELECT m.id, p.propertyValue AS deadLetterReason FROM messages m JOIN applicationProperties p ON p.messageId = m.id AND p.propertyName = 'DeadLetterReason' WHERE p.propertyValue IS NOT NULL",
  };
}
