export type ReceiveOptionType =
  | {
      type: 'string';
      label: string;
      pattern?: string;
    }
  | {
      type: 'number';
      label: string;
    }
  | {
      type: 'enum';
      enum: string[];
      label: string;
    };

export type ReceiveOptionsDescription = {
  genericOptions: {
    maxAmountOfMessagesToReceive: {
      type: 'number';
      label: 'Max amount of messages to receive';
    };
    [key: string]: ReceiveOptionType;
  };

  /**
   * Options per receive mode
   */
  modes: Record<string, Record<string, ReceiveOptionType>>;
};

export type ReceiveOptions = {
  receiveMode: string;
  maxAmountOfMessagesToReceive?: number;
  [key: string]: string | number | undefined;
};
