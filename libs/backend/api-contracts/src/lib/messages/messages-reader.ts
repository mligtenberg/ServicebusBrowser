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
  cancelSession(
    receiveEndpoint: ReceiveEndpoint,
    continuationToken: string,
  ): Promise<void>;
  /** Closes any connections cached for later reuse, e.g. when the underlying connection config changes. */
  dispose?(): Promise<void>;
};
