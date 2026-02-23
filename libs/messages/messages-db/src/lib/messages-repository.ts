import {
  MessageFilter,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { Page } from './models/page';
import { getMessagesDb } from './get-database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { MessagesDatabase } from './messages-database';

export class MessagesRepository {
  database: IDBDatabase;
  messagesDbs: Record<UUID, MessagesDatabase> = {};

  constructor(database: IDBDatabase) {
    this.database = database;
  }

  async addPage(page: Omit<Page, 'messageStorage'>) {
    await new Promise((resolve, reject) => {
      const pagesStore = this.database
        .transaction('pages', 'readwrite')
        .objectStore('pages');
      const request = pagesStore.put({
        name: page.name,
        retrievedAt: page.retrievedAt,
        id: page.id,
        messageStorage: 'sqlite'
      } as Page);

      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  async addMessages(pageId: UUID, messages: ServiceBusReceivedMessage[]) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.addMessages(messages);
  }

  async countMessages(
    pageId: UUID,
    filter?: MessageFilter,
    selection?: string[],
  ) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.countMessages(filter, selection);
  }

  async getMessage(pageId: UUID, sequenceNumber: string) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.getMessage(sequenceNumber);
  }

  async getMessages(
    pageId: UUID,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.getMessages(
      filter,
      skip,
      take,
      ascending,
      selection,
    );
  }

  async walkMessagesWithCallback(
    pageId: UUID,
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
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.walkMessagesWithCallback(
      callback,
      filter,
      skip,
      take,
      ascending,
      selection,
    );
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
    }).then((page) => ({
      ...page,
      messageStorage: page.messageStorage ?? 'indexeddb',
    }));
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
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    await messagesDb.deleteDatabase();

    const pagesStore = this.database
      .transaction('pages', 'readwrite')
      .objectStore('pages');

    pagesStore.delete(pageId);
  }

  private async getMessagesDb(page: Page) {
    if (page.id in this.messagesDbs) {
      return this.messagesDbs[page.id];
    }

    const messagesDb = await getMessagesDb(page);
    this.messagesDbs[page.id] = messagesDb;
    return messagesDb;
  }
}
