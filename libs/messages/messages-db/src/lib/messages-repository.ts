import {
  MessageFilter,
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

  async countMessages(pageId: UUID, filter?: MessageFilter) {
    const messagesDb = await getMessagesDb(pageId);
    const objectStore = messagesDb
      .transaction('messages')
      .objectStore('messages');
    if (!filter) {
      return objectStore.count();
    }

    let count = 0;
    return await new Promise((resolve, reject) => {
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = (event.target as any).result as IDBCursorWithValue;
        if (!cursor) {
          resolve(count);
        }

        const message = cursor.value as ServiceBusReceivedMessage;

        if (messageInFilter(message, filter)) {
          count++;
        }

        cursor.continue();
      };
    });
  }

  async getMessages(
    pageId: UUID,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
  ) {
    const messagesDb = await getMessagesDb(pageId);
    const objectStore = messagesDb
      .transaction('messages')
      .objectStore('messages');
    if (!filter) {
      return objectStore.getAll();
    }

    let walked = 0;

    return await new Promise((resolve, reject) => {
      const messages: ServiceBusReceivedMessage[] = [];
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = (event.target as any).result as IDBCursorWithValue;
        if (!cursor) {
          resolve(messages);
        }

        const message = cursor.value as ServiceBusReceivedMessage;

        if (!filter || messageInFilter(message, filter)) {
          walked++;
          if (!skip || walked > skip) {
            messages.push(message);
          }
        }

        if (take && walked >= (skip ?? 0) + take) {
          resolve(messages);
        }

        cursor.continue();
      };
    });
  }

  async closePage(pageId: UUID) {
    const pagesStore = this.database
      .transaction('pages', 'readwrite')
      .objectStore('pages');
    pagesStore.delete(pageId);

    deleteMessagesDb(pageId);
  }
}
