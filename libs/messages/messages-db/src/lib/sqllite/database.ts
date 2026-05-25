import { Database as SqliteDatabase } from '@sqlite.org/sqlite-wasm';
import { initializeWorker } from './init-sqllite';

(window as any).enableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = true;
(window as any).disableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = false;

let counter = 0;
export class Database {
  private database?: SqliteDatabase;
  private promiser?: Awaited<ReturnType<typeof initializeWorker>>;

  /**
   * @param dbPath Path relative to the 'sqlite/' OPFS directory, without the .sqlite3 extension.
   *               May include a single subdirectory prefix, e.g. "{workspaceId}/{pageId}".
   */
  constructor(private dbPath: string) {}

  async exec(sql: string, args: any[] = []) {
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

    return await this.promiser('exec', {
      sql,
      bind: args.length > 0 ? args : undefined,
      rowMode: 'array',
    });
  }

  async initialize() {
    if (this.promiser) {
      return;
    }

    await this.ensureParentDirectory();

    this.promiser = await initializeWorker();
    const openResponse = await this.promiser('open', {
      filename: `file:sqlite/${this.dbPath}.sqlite3?vfs=opfs`,
    });

    if (openResponse.type === 'error')
      throw new Error(
        `Failed to open database: ${openResponse.result.message}`,
      );

    this.database = openResponse.result;
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
