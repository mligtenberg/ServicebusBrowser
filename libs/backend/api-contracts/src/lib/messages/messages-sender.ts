import { Message } from './message';
import { SendEndpoint } from '../send-endpoint';

export type MessagesSender = {
  send(endpoint: SendEndpoint, message: Message): Promise<void>;
  sendBatch(endpoint: SendEndpoint, messages: Message[]): Promise<void>;
};
