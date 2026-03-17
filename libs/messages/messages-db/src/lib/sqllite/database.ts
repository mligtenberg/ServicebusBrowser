import { Database as SqliteDatabase } from '@sqlite.org/sqlite-wasm';
import { initializeWorker } from './init-sqllite';

(window as any).enableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = true;
(window as any).disableSqliteDebugging = () => (window as any).DEBUG_SQLITE_QUERIES = false;

let counter = 0;
export class Database {
  private database?: SqliteDatabase;
  private promiser?: Awaited<ReturnType<typeof initializeWorker>>;

  constructor(private dbName: string) {}

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

    this.promiser = await initializeWorker();
    const openResponse = await this.promiser('open', {
      filename: `file:sqlite/${this.dbName}.sqlite3?vfs=opfs`,
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
    await sqliteRoot.removeEntry(`${this.dbName}.sqlite3`);
    this.database = undefined;
  }
}

