import { Message } from './message';
import { SendEndpoint } from '../endpoints/send-endpoint';

export type MessagesSender = {
  send(endpoint: SendEndpoint, message: Message): Promise<void>;
  sendBatch(endpoint: SendEndpoint, messages: Message[]): Promise<void>;
};
