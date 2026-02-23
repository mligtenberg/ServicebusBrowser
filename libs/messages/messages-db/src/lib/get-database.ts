import { IndexedDbMessagesDatabase } from './indexeddb-messages-database';
import { Page } from './models/page';
import { SqliteMessagesDatabase } from './sqlite-messages.database';
import { MessagesDatabase } from './messages-database';

export function getPagesDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('message-pages', 1);

    request.onupgradeneeded = function (e) {
      const db = request.result;
      // Create an objectStore for this database
      db.createObjectStore('pages', {
        keyPath: 'id',
        autoIncrement: false
      });

      return;
    }

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function (e) {
      reject(e);
    };
  });
}

const dbs: Record<string, MessagesDatabase> = {};

export async function getMessagesDb(page: Page): Promise<MessagesDatabase> {
  if (page.id in dbs) {
    const db = dbs[page.id];
    if (db instanceof SqliteMessagesDatabase)
      await db.initialize();
    return db;
  }

  if (page.messageStorage === 'indexeddb') {
    const db = new IndexedDbMessagesDatabase(page.id);
    dbs[page.id] = db;
    return db;
  }
  if (page.messageStorage === 'sqlite') {
    const db = new SqliteMessagesDatabase(page.id);
    dbs[page.id] = db;
    await db.initialize();
    return db;
  }
  return Promise.reject('Unsupported message storage');
}
