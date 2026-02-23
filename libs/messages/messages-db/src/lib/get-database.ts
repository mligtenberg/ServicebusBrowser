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


export async function getMessagesDb(page: Page): Promise<MessagesDatabase> {
  if (page.messageStorage === 'indexeddb') {
    return new IndexedDbMessagesDatabase(page.id);
  }
  if (page.messageStorage === 'sqlite') {
    const db = new SqliteMessagesDatabase(page.id);
    await db.initialize();
    return db;
  }
  return Promise.reject('Unsupported message storage');
}
