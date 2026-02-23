import { MessageFilter, ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';

export type MessagesDatabase = {
  addMessages(messages: ServiceBusReceivedMessage[]): Promise<void>;
  getMessage(
    sequenceNumber: string,
  ): Promise<ServiceBusReceivedMessage | undefined>;
  countMessages(filter?: MessageFilter, selection?: string[]): Promise<number>;
  getMessages(
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ): Promise<ServiceBusReceivedMessage[]>;
  walkMessagesWithCallback(
    callback: (
      message: ServiceBusReceivedMessage,
      index: number,
    ) => void | Promise<void>,
    filter?: MessageFilter,
    skip?: number,
    take?: number,
    ascending?: boolean,
    selection?: string[],
  ): Promise<void>;
  deleteDatabase(): Promise<void>;
};
