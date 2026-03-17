import { ReceivedMessage } from './message';
import { ReceiveEndpoint } from '../endpoints/receive-endpoint';
import { ReceiveOptions } from '../endpoints/receive-options';

export type MessagesReader = {
  receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options?: ReceiveOptions,
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }>;
  clear(
    receiveEndpoint: ReceiveEndpoint,
    continuationToken?: string,
  ): Promise<{ continuationToken?: string }>;
};
