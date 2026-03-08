import {
  Connection,
  MessagesReader,
  PropertyValue,
  ReceivedMessage,
  ReceiveEndpoint,
  ReceiveOptions,
} from '@service-bus-browser/api-contracts';
import Long from 'long';
import {
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from '@azure/service-bus';
import { sequenceNumberToKey } from './internal/sequence-number-to-key';
import { getCredential } from './internal/credential-helper';

export class ServiceBusMessagesReader implements MessagesReader {
  constructor(private connection: Connection) {}

  readonly availableOptions: ReceiveOptions = {
    genericOptions: {
      maxAmountOfMessagesToReceive: {
        type: 'number',
        label: 'Max amount of messages-operations to receive',
      },
    },
    modes: {
      peek: {
        fromSequenceNumber: {
          type: 'number',
          label: 'From sequence number',
        },
      },
      receive: {},
    },
  };

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
      fromSequenceNumber?: number | undefined;
    } = { receiveMode: 'peek' },
  ): Promise<ReceivedMessage[]> {
    const receiveClient = this.getReceiver(
      receiveEndpoint,
      options.receiveMode === 'peek' ? 'peekLock' : 'receiveAndDelete',
    );
    const messages =
      options.receiveMode === 'peek'
        ? await receiveClient.peekMessages(
            options.maxAmountOfMessagesToReceive ?? 1,
            {
              fromSequenceNumber: options.fromSequenceNumber
                ? Long.fromNumber(options.fromSequenceNumber)
                : undefined,
            },
          )
        : await receiveClient.receiveMessages(
            options.maxAmountOfMessagesToReceive ?? 1,
            { maxWaitTimeInMs: 300 },
          );

    await receiveClient.close();

    return messages.map((message) => this.mapReceivedMessage(message));
  }

  private mapReceivedMessage(
    message: ServiceBusReceivedMessage,
  ): ReceivedMessage {
    return {
      key: sequenceNumberToKey(message.sequenceNumber?.toString() ?? '0'),
      messageId: message.messageId?.toString(),
      body: message.body,
      contentType: message.contentType,
      sequence: message.sequenceNumber?.toString() ?? '0',
      systemProperties: Object.entries(message)
        .filter(
          ([key]) =>
            !['messageId', 'body', 'contentType', 'sequenceNumber'].includes(
              key,
            ),
        )
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, PropertyValue>,
        ),
      applicationProperties: message.applicationProperties,
    };
  }

  private getReceiver(
    endpoint: ReceiveEndpoint,
    receiveMode: 'peekLock' | 'receiveAndDelete',
  ): ServiceBusReceiver {
    const auth = getCredential(this.connection);
    const client = new ServiceBusClient(auth.hostName, auth.credential);

    if ('queueName' in endpoint) {
      return client.createReceiver(endpoint.queueName, {
        receiveMode,
        subQueueType: endpoint.channel,
        skipParsingBodyAsJson: true,
      });
    }

    return client.createReceiver(
      endpoint.topicName,
      endpoint.subscriptionName,
      {
        receiveMode: receiveMode,
        subQueueType: endpoint.channel,
        skipParsingBodyAsJson: true,
      },
    );
  }
}
