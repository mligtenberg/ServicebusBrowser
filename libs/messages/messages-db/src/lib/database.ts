import { UUID } from '@service-bus-browser/shared-contracts';

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


export function getMessagesDb(pageId: UUID) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(`${pageId}-messages`, 1);

    request.onupgradeneeded = function (e) {
      const db = request.result;
      // Create an objectStore for this database
      db.createObjectStore('messages', {
        keyPath: 'sequenceNumber',
        autoIncrement: false,
      });

      return;
    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function (e) {
      reject(e);
    };
  });
}

export function deleteMessagesDb(pageId: UUID) {
  indexedDB.deleteDatabase(`${pageId}-messages`);
}
