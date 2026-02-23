import { UUID } from '@service-bus-browser/shared-contracts';
import { MessagesDatabase } from './messages-database';
import { MessageFilter, sequenceNumberToKey, ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { messageInFilter } from '@service-bus-browser/filtering';
import { isFilterEmpty } from './repo-helpers';

export class IndexedDbMessagesDatabase implements MessagesDatabase {
  private readonly _pageId: UUID;
  constructor(pageId: UUID) {
    this._pageId = pageId;
  }

  async addMessages(messages: ServiceBusReceivedMessage[]) {
    const messagesDb = await this.getMessagesDb();
    const messagesStore = messagesDb
      .transaction('messages', 'readwrite')
      .objectStore('messages');

    for (const message of messages) {
      messagesStore.put(message);
    }
  }

  async countMessages(filter?: MessageFilter, selection?: string[]) {
    const messagesDb = await this.getMessagesDb();
    const objectStore = messagesDb
      .transaction('messages', 'readonly')
      .objectStore('messages');
    if ((!filter || isFilterEmpty(filter)) && !selection) {
      return await new Promise<number>((resolve) => {
        const countRequest = objectStore.count();
        countRequest.onsuccess = (event) =>
          resolve((event.target as any).result);
      });
    }

    let count = 0;
    if (selection) {
      for (const key of selection) {
        const message = await this.getMessage(key);
        if (filter && !messageInFilter(message, filter)) {
          continue;
        }

        count++;
      }

      return count;
    }

    await this.walkMessagesWithCallback(
      () => {
        count++;
      },
      filter,
      undefined,
      undefined,
      undefined,
      selection,
    );

    return count;
  }

  async getMessage(sequenceNumber: string) {
    const messagesDb = await this.getMessagesDb();
    const objectStore = messagesDb
      .transaction('messages', 'readonly')
      .objectStore('messages');

    // the max sequenc number of a long is 19 digits long
    const key = sequenceNumberToKey(sequenceNumber);

    return await new Promise<ServiceBusReceivedMessage>((resolve, reject) => {
      const request = objectStore.get(key);
      request.onsuccess = (event) => resolve((event.target as any).result);
    });
  }

  async getMessages(
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ) {
    if (take === 0) {
      return [];
    }
    if (ascending === undefined) {
      ascending = true;
    }

    return await new Promise<ServiceBusReceivedMessage[]>((resolve, reject) => {
      const messages: ServiceBusReceivedMessage[] = [];
      this.walkMessagesWithCallback(
        (message) => {
          messages.push(message);
        },
        filter,
        skip,
        take,
        ascending,
        selection,
      ).then(() => resolve(messages));
    });
  }

  async walkMessagesWithCallback(
    callback: (
      message: ServiceBusReceivedMessage,
      index: number,
    ) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ) {
    if (take === 0) {
      return;
    }
    if (ascending === undefined) {
      ascending = true;
    }

    const messagesDb = await this.getMessagesDb();

    if (selection?.length) {
      await this.walkMessagesWithCallbackForSelection(
        callback,
        selection,
        filter,
        skip,
        take,
        ascending,
      );
    }

    let walked = 0;
    let currentIndex = 0;
    let continueCursor = true;
    let lastKey: string | null = null;

    while (continueCursor) {
      const objectStore = messagesDb
        .transaction('messages', 'readonly')
        .objectStore('messages');

      const idbFilter = lastKey
        ? IDBKeyRange.lowerBound(lastKey, true)
        : undefined;

      continueCursor = await new Promise<boolean>((resolve, reject) => {
        objectStore.openCursor(
          idbFilter,
          ascending ? 'next' : 'prev',
        ).onsuccess = (event) => {
          const cursor = (event.target as any).result as IDBCursorWithValue;
          if (!cursor) {
            resolve(false);
            return;
          }

          const message = cursor.value as ServiceBusReceivedMessage;
          if (message.key === lastKey) {
            cursor.continue();
            return;
          }

          lastKey = message.key;

          if (!filter || messageInFilter(message, filter)) {
            walked++;

            if (skip && walked <= skip) {
              cursor.continue();
              return;
            }

            if (take && walked > (skip ?? 0) + take) {
              resolve(false);
              return;
            }

            const result = callback?.(message, currentIndex);
            currentIndex++;
            if (result instanceof Promise) {
              result.then(() => resolve(true));
              return;
            }
          }

          cursor.continue();
          return;
        };
      });
    }
  }

  private async walkMessagesWithCallbackForSelection(
    callback: (
      message: ServiceBusReceivedMessage,
      index: number,
    ) => void | Promise<void>,
    selection: string[],
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
  ) {
    let walked = 0;
    let currentIndex = 0;

    if (selection?.length) {
      let keys = selection.map(sequenceNumberToKey);
      if (ascending) {
        keys = keys.sort((a, b) => a.localeCompare(b));
      } else {
        keys = keys.sort((a, b) => b.localeCompare(a));
      }

      for (const key of keys) {
        const message = await this.getMessage(key);
        if (filter && !messageInFilter(message, filter)) {
          continue;
        }

        walked++;
        if (!message) {
          continue;
        }

        if (skip && walked <= skip) {
          continue;
        }

        const result = callback(message, currentIndex);
        currentIndex++;
        if (result instanceof Promise) {
          await result;
        }

        if (take && walked >= (skip ?? 0) + take) {
          return;
        }
      }

      return;
    }
  }

  private async getMessagesDb() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(`${this._pageId}-messages`, 1);

      request.onupgradeneeded = function (e) {
        const db = request.result;
        // Create an objectStore for this database
        const store = db.createObjectStore('messages', {
          keyPath: 'key',
          autoIncrement: false,
        });

        store.createIndex('Key', 'key', { unique: true });

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

  deleteDatabase(): Promise<void> {
    indexedDB.deleteDatabase(`${this._pageId}-messages`);
    return Promise.resolve();
  }
}
