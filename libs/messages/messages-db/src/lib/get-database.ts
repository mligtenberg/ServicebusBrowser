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
  await db.initialize();
  return db;
}

const dbs: Record<string, MessagesDatabase> = {};

export async function getMessagesDb(page: Page): Promise<MessagesDatabase> {
  if (page.id in dbs) {
    const db = dbs[page.id];
    // Make sure the database is initialized
    // if the database is already initialized, this will do nothing
    // if the db is retrieved really fast, it might not be initialized yet
    if (db instanceof SqliteMessagesDatabase) {
      await db.initialize();
    }
    return db;
  }

  const db = new SqliteMessagesDatabase(page.id);
  dbs[page.id] = db;
  await db.initialize();
  return db;
}
