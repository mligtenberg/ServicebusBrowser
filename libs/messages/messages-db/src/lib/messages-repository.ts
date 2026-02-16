import {
  MessageFilter, sequenceNumberToKey,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { Page } from './models/page';
import { deleteMessagesDb, getMessagesDb } from './database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { messageInFilter } from '@service-bus-browser/filtering';

export class MessagesRepository {
  database: IDBDatabase;

  constructor(database: IDBDatabase) {
    this.database = database;
  }

  async addPage(page: Page) {
    await new Promise((resolve, reject) => {
      const pagesStore = this.database
        .transaction('pages', 'readwrite')
        .objectStore('pages');
      const request = pagesStore.put({
        name: page.name,
        retrievedAt: page.retrievedAt,
        id: page.id,
      } as Page);

      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  async addMessages(pageId: UUID, messages: ServiceBusReceivedMessage[]) {
    const messagesDb = await getMessagesDb(pageId);
    const messagesStore = messagesDb
      .transaction('messages', 'readwrite')
      .objectStore('messages');

    for (const message of messages) {
      messagesStore.put(message);
    }
  }

  async countMessages(
    pageId: UUID,
    filter?: MessageFilter,
    selection?: string[],
  ) {
    const messagesDb = await getMessagesDb(pageId);
    const objectStore = messagesDb
      .transaction('messages', 'readonly')
      .objectStore('messages');
    if ((!filter || this.isFilterEmpty(filter)) && !selection) {
      return await new Promise<number>((resolve) => {
        const countRequest = objectStore.count();
        countRequest.onsuccess = (event) =>
          resolve((event.target as any).result);
      });
    }

    let count = 0;
    if (selection) {
      for (const key of selection) {
        const message = await this.getMessage(pageId, key);
        if (filter && !messageInFilter(message, filter)) {
          continue;
        }

        count++;
      }

      return count;
    }

    return await new Promise<number>((resolve) => {
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = (event.target as any).result as IDBCursorWithValue;
        if (!cursor) {
          resolve(count);
          return;
        }

        const message = cursor.value as ServiceBusReceivedMessage;

        if (filter && messageInFilter(message, filter)) {
          count++;
        }

        cursor.continue();
      };
    });
  }

  async getMessage(pageId: UUID, sequenceNumber: string) {
    const messagesDb = await getMessagesDb(pageId);
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
    pageId: UUID,
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
        pageId,
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
    pageId: UUID,
    callback: (message: ServiceBusReceivedMessage) => void | Promise<void>,
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

    const messagesDb = await getMessagesDb(pageId);

    if (selection?.length) {
      await this.walkMessagesWithCallbackForSelection(
        pageId,
        callback,
        selection,
        filter,
        skip,
        take,
        ascending,
      )
    }

    let walked = 0;
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

            if(skip && walked <= skip) {
              cursor.continue();
              return;
            }

            if (take && walked > (skip ?? 0) + take) {
              resolve(false);
              return;
            }

            const result = callback?.(message);
            if (result instanceof Promise) {
              result.then(() => resolve(true));
            } else {
              cursor.continue();
              return;
            }
          }
        };
      });
    }
  }

  private async walkMessagesWithCallbackForSelection(
    pageId: UUID,
    callback: (message: ServiceBusReceivedMessage) => void | Promise<void>,
    selection: string[],
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
  ) {
    let walked = 0;

    if (selection?.length) {
      let keys = selection.map(sequenceNumberToKey);
      if (ascending) {
        keys = keys.sort((a, b) => a.localeCompare(b));
      } else {
        keys = keys.sort((a, b) => b.localeCompare(a));
      }

      for (const key of keys) {
        const message = await this.getMessage(pageId, key);
        walked++;
        if (!message) {
          continue;
        }

        if (skip && walked <= skip) {
          continue;
        }

        const result = callback(message);
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

  async getPages() {
    const pagesStore = this.database
      .transaction('pages', 'readonly')
      .objectStore('pages');
    return await new Promise<Page[]>((resolve, reject) => {
      const request = pagesStore.getAll();
      request.onsuccess = (event) => resolve((event.target as any).result);
    });
  }

  async getPage(pageId: UUID) {
    const pagesStore = this.database
      .transaction('pages', 'readonly')
      .objectStore('pages');
    return await new Promise<Page>((resolve, reject) => {
      const request = pagesStore.get(pageId);
      request.onsuccess = (event) => resolve((event.target as any).result);
    });
  }

  async updatePageName(pageId: UUID, pageName: string) {
    const page = await this.getPage(pageId);
    const pagesStore = this.database
      .transaction('pages', 'readwrite')
      .objectStore('pages');
    pagesStore.put({
      ...page,
      name: pageName,
    } as Page);
  }

  async closePage(pageId: UUID) {
    const pagesStore = this.database
      .transaction('pages', 'readwrite')
      .objectStore('pages');
    pagesStore.delete(pageId);

    deleteMessagesDb(pageId);
  }

  private isFilterEmpty(filter: MessageFilter) {
    return (
      !filter.body.length &&
      !filter.systemProperties.length &&
      !filter.applicationProperties.length
    );
  }
}
