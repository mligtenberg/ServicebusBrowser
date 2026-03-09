import { Page } from './models/page';
import { SqliteMessagesDatabase } from './sqlite-messages.database';
import { MessagesDatabase } from './messages-database';
import { PagesDatabase } from './pages-database';
import { SqlitePagesDatabase } from './sqlite-pages.database';

let db: PagesDatabase;
export async function getPagesDb(): Promise<PagesDatabase> {
  if (db) {
    return db;
  }

  db = new SqlitePagesDatabase();
  return db;
}

const dbs: Record<string, MessagesDatabase> = {};

export async function getMessagesDb(page: Page): Promise<MessagesDatabase> {
  if (page.id in dbs) {
    const db = dbs[page.id];
    if (db instanceof SqliteMessagesDatabase)
      await db.initialize();
    return db;
  }

  const db = new SqliteMessagesDatabase(page.id);
  dbs[page.id] = db;
  await db.initialize();
  return db;
}
