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
    if (!filter || this.isFilterEmpty(filter)) {
      return await new Promise<number>((resolve) => {
        const countRequest = objectStore.count();
        countRequest.onsuccess = (event) =>
          resolve((event.target as any).result);
      });
    }

    let count = 0;
    return await new Promise<number>((resolve) => {
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

  async getMessage(pageId: UUID, sequenceNumber: string) {
    const messagesDb = await getMessagesDb(pageId);
    const objectStore = messagesDb
      .transaction('messages')
      .objectStore('messages');

    // the max sequenc number of a long is 19 digits long
    const prefixAmount = 20 - sequenceNumber.length;
    let key = '';
    for (let i = 0; i < prefixAmount; i++) {
      key += '0';
    }
    key += sequenceNumber;

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
  ) {
    if (take === 0) {
      return [];
    }

    const messagesDb = await getMessagesDb(pageId);
    const objectStore = messagesDb
      .transaction('messages')
      .objectStore('messages');
    let walked = 0;

    return await new Promise<ServiceBusReceivedMessage[]>((resolve, reject) => {
      const messages: ServiceBusReceivedMessage[] = [];
      objectStore
        .index('Key')
        .openCursor(null, ascending ? 'next' : 'prev').onsuccess = (event) => {
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
