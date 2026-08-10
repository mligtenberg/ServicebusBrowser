import { Database as SqliteDatabase } from '@sqlite.org/sqlite-wasm';
import { initializeWorker } from './init-sqllite';

(window as any).enableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = true;
(window as any).disableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = false;

let counter = 0;

/**
 * The Worker1 promiser rejects with the raw `{type: 'error', result: {message, ...}}`
 * event object, not an `Error` — so a bad SQL statement (e.g. an unknown column
 * in the MCP query_message_page tool) surfaces as a plain object. Callers that do
 * `err instanceof Error ? err.message : String(err)` then get the useless
 * "[object Object]" instead of SQLite's actual error message. Extract it here so
 * every caller of `exec()` sees a real `Error`.
 */
function toSqliteError(err: unknown): Error {
  const message = (err as { result?: { message?: string } })?.result?.message;
  return new Error(message ?? (err instanceof Error ? err.message : String(err)));
}
export class Database {
  private database?: SqliteDatabase;
  private promiser?: Awaited<ReturnType<typeof initializeWorker>>;

  /**
   * @param dbPath Path relative to the 'sqlite/' OPFS directory, without the .sqlite3 extension.
   *               May include a single subdirectory prefix, e.g. "{workspaceId}/{pageId}".
   * @param options.readOnly Opens the file with the `mode=ro` URI flag (ADR-0012) — the only
   *               safety mechanism for the raw-SQL MCP query tool, enforced by SQLite itself
   *               rather than by inspecting the statement.
   */
  constructor(private dbPath: string, private options: { readOnly?: boolean } = {}) {}

  async exec(sql: string, args: any[] = [], execOptions: { columnNames?: string[] } = {}) {
    if (!this.database || !this.promiser) {
      throw new Error('Database not initialized');
    }

    args = args.map(arg => arg instanceof Date ? arg.toISOString() : arg);

    if ((window as any).DEBUG_SQLITE_QUERIES) {
      console.debug(
        `SQLITE_QUERY_${counter++}: ${sql.replace(/\s+/g, ' ')}`,
        args
      );
    }

    try {
      return await this.promiser('exec', {
        sql,
        bind: args.length > 0 ? args : undefined,
        rowMode: 'array',
        ...execOptions,
      });
    } catch (err) {
      throw toSqliteError(err);
    }
  }

  async initialize() {
    if (this.promiser) {
      return;
    }

    await this.ensureParentDirectory();

    this.promiser = await initializeWorker();
    const modeFlag = this.options.readOnly ? '&mode=ro' : '';
    // The promiser rejects (rather than resolving with `type: 'error'`) when
    // 'open' fails — see toSqliteError()'s doc comment — so this catches the
    // rejection rather than checking openResponse.type, which is otherwise
    // unreachable; the success-only cast reflects that a resolved promise is
    // always the 'open' success shape.
    let openResponse: { result: SqliteDatabase };
    try {
      openResponse = (await this.promiser('open', {
        filename: `file:sqlite/${this.dbPath}.sqlite3?vfs=opfs${modeFlag}`,
      })) as { result: SqliteDatabase };
    } catch (err) {
      throw toSqliteError(err);
    }

    this.database = openResponse.result;

    // The MCP headless renderer (ADR-0011) opens its own connections to a
    // page's SQLite file while the visible app window may already hold one
    // open — without this, that contention surfaces immediately as
    // `SQLITE_BUSY: database is locked` instead of the two connections
    // simply taking turns. Best-effort: a connection is still usable (just
    // liable to that instant-fail behavior) if the VFS doesn't honor it.
    try {
      await this.exec('PRAGMA busy_timeout = 5000');
    } catch (err) {
      console.warn('Failed to set busy_timeout on SQLite connection:', err);
    }
  }

  /** Closes the connection without deleting the underlying file (unlike destroy()). */
  async close(): Promise<void> {
    if (this.database && this.promiser) {
      await this.promiser('close', {});
      this.database = undefined;
    }
  }

  async destroy() {
    if (this.database && this.promiser) {
      this.promiser('close', (this.database as any).dbId);
    }

    const opfsRoot = await navigator.storage.getDirectory();
    const sqliteRoot = await opfsRoot.getDirectoryHandle('sqlite');

    const parts = this.dbPath.split('/');
    if (parts.length > 1) {
      const subdir = await sqliteRoot.getDirectoryHandle(parts[0]);
      await subdir.removeEntry(`${parts[1]}.sqlite3`);
    } else {
      await sqliteRoot.removeEntry(`${this.dbPath}.sqlite3`);
    }

    this.database = undefined;
  }

  private async ensureParentDirectory(): Promise<void> {
    const parts = this.dbPath.split('/');
    if (parts.length <= 1) {
      return;
    }

    const opfsRoot = await navigator.storage.getDirectory();
    const sqliteRoot = await opfsRoot.getDirectoryHandle('sqlite', { create: true });
    await sqliteRoot.getDirectoryHandle(parts[0], { create: true });
  }
}
