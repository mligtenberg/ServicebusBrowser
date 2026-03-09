import { MessageFilter } from '@service-bus-browser/messages-contracts';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';

export type MessagesDatabase = {
  addMessages(messages: ReceivedMessage[]): Promise<void>;
  getMessage(key: string): Promise<ReceivedMessage | undefined>;
  countMessages(
    filter?: MessageFilter,
    selectionKeys?: string[],
  ): Promise<number>;
  getMessages(
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selectionKeys?: string[],
  ): Promise<ReceivedMessage[]>;
  walkMessagesWithCallback(
    callback: (message: ReceivedMessage, index: number) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selectionKeys?: string[],
  ): Promise<void>;
  deleteDatabase(): Promise<void>;
};
