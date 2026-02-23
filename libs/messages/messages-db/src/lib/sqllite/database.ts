import {
  Database as SqliteDatabase
} from '@sqlite.org/sqlite-wasm';
import { initializeWorker } from './init-sqllite';

export class Database {
  private database?: SqliteDatabase;
  private promiser?: Awaited<ReturnType<typeof initializeWorker>>;

  constructor(private dbName: string) {}

  async exec(sql: string, args: any[] = []) {
    if (!this.database || !this.promiser) {
      throw new Error('Database not initialized');
    }
    const result = await this.promiser('exec', {
      sql,
      bind: args.length > 0 ? args : undefined,
      rowMode: 'object',
    });
    return result;
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

