import { ReceivedMessage } from './message';
import { ReceiveEndpoint } from '../receive-endpoint';

export type ReceiveOptionType =
  | {
      type: 'string' | 'number';
      label: string;
    }
  | {
      type: 'enum';
      enum: string[];
      label: string;
    };

export type ReceiveOptions = {
  genericOptions: {
    maxAmountOfMessagesToReceive: {
      type: 'number';
      label: 'Max amount of messages-operations to receive';
    };
    [key: string]: ReceiveOptionType;
  };

  /**
   * Options per receive mode
   */
  modes: Record<string, Record<string, ReceiveOptionType>>;
};

export type MessagesReader = {
  readonly availableOptions: ReceiveOptions;
  receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options?: {
      receiveMode: string;
      maxAmountOfMessagesToReceive?: number;
      [key: string]: string | number | undefined;
    },
  ): Promise<ReceivedMessage[]>;
};
