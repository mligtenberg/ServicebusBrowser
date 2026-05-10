import { MessageFilter } from '@service-bus-browser/filtering';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';

export type MessagesDatabase = {
  addMessages(messages: ReceivedMessage[]): Promise<void>;
  getMessage(key: string): Promise<ReceivedMessage | undefined>;
  countMessages(
    filter?: MessageFilter,
    selectionKeys?: string[],
  ): Promise<number>;
  getHeaderPropertyLabels(): Promise<{ label: string; type: string }[]>;
  getPropertiesPropertyLabels(): Promise<{ label: string; type: string }[]>;
  getDeliveryAnnotationsPropertyLabels(): Promise<
    { label: string; type: string }[]
  >;
  getMessageAnnotationsPropertyLabels(): Promise<
    { label: string; type: string }[]
  >;
  getApplicationPropertyLabels(): Promise<{ label: string; type: string }[]>;
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
  getVisibleColumns(): Promise<string[] | null>;
  setVisibleColumns(fields: string[]): Promise<void>;
  deleteDatabase(): Promise<void>;
};
