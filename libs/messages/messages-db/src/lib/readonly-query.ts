import { UUID } from '@service-bus-browser/shared-contracts';
import { Database } from './sqllite/database';

export interface RawMessagePageQueryResult {
  columns: string[];
  rows: unknown[][];
}

async function execReadOnly(
  database: Database,
  sql: string,
): Promise<RawMessagePageQueryResult> {
  const response = (await database.exec(sql, [], { columnNames: [] })) as {
    result?: { resultRows?: unknown[]; columnNames?: string[] };
  };
  return {
    columns: response.result?.columnNames ?? [],
    rows: (response.result?.resultRows ?? []) as unknown[][],
  };
}

/**
 * Opens a single read-only connection to a Message Page's SQLite file and
 * runs `run` against it, closing afterward. Exported so a caller needing
 * several queries (e.g. describeMessagePage's schema introspection) shares
 * one connection instead of opening one per query — the visible app window
 * may already hold its own open (read-write) connection to the same OPFS
 * file, so opening several *more* connections concurrently, on top of that,
 * is a direct path to `SQLITE_BUSY: database is locked`.
 */
export async function withReadOnlyMessagePage<T>(
  workspaceId: UUID,
  pageId: UUID,
  run: (query: (sql: string) => Promise<RawMessagePageQueryResult>) => Promise<T>,
): Promise<T> {
  const database = new Database(`${workspaceId}/${pageId}`, { readOnly: true });
  await database.initialize();
  try {
    return await run((sql) => execReadOnly(database, sql));
  } finally {
    await database.close();
  }
}

/**
 * Executes client-supplied SQL against a Message Page's SQLite file (ADR-0012).
 * The only safety mechanism is opening the connection with the `mode=ro` file-URI
 * flag — this blocks all mutation at the SQLite engine level regardless of
 * statement shape, rather than parsing/rejecting the SQL. Opens and closes a
 * dedicated connection per call; not cached, since ad-hoc queries are one-shot.
 */
export async function queryMessagePageReadOnly(
  workspaceId: UUID,
  pageId: UUID,
  sql: string,
): Promise<RawMessagePageQueryResult> {
  return withReadOnlyMessagePage(workspaceId, pageId, (query) => query(sql));
}
