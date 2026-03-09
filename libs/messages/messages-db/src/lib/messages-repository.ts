import {
  MessageFilter,
} from '@service-bus-browser/messages-contracts';
import { Page } from './models/page';
import { getMessagesDb } from './get-database';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import { PagesDatabase } from './pages-database';

export class MessagesRepository {
  constructor(private pagesDb: PagesDatabase) {}

  async addPage(page: Page) {
    await this.pagesDb.addPage(page);
  }

  async addMessages(pageId: UUID, messages: ReceivedMessage[]) {
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
    callback: (message: ReceivedMessage, index: number) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selectionKeys?: string[],
  ) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    return await messagesDb.walkMessagesWithCallback(
      callback,
      filter,
      skip,
      take,
      ascending,
      selectionKeys,
    );
  }

  async getPages() {
    return await this.pagesDb.getPages();
  }

  async getPage(pageId: UUID) {
    const page = await this.pagesDb.getPage(pageId);
    if (!page) {
      throw new Error(`Page with id ${pageId} not found`);
    }

    return page;
  }

  async updatePageName(pageId: UUID, pageName: string) {
    await this.pagesDb.updatePageName(pageId, pageName);
  }

  async closePage(pageId: UUID) {
    const page = await this.getPage(pageId);
    const messagesDb = await this.getMessagesDb(page);
    await messagesDb.deleteDatabase();

    await this.pagesDb.closePage(pageId);
  }

  private async getMessagesDb(page: Page) {
    return await getMessagesDb(page);
  }
}
