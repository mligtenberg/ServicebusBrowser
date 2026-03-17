import {
  Connection,
  MessagesReader,
  PropertyValue,
  ReceivedMessage,
  ReceiveEndpoint,
} from '@service-bus-browser/api-contracts';
import Long from 'long';
import {
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from '@azure/service-bus';
import { sequenceNumberToKey } from './internal/sequence-number-to-key';
import { getCredential } from './internal/credential-helper';

type ContinuationTokenBody = {
  lastLoadedSequenceNumber: string;
  alreadyLoadedAmountOfMessages: number;
};

type DeleteContinuationTokenBody = {
  zeroMessagesReceivedCounter: number;
}

export class ServiceBusMessagesReader implements MessagesReader {
  constructor(private connection: Connection) {}

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
      fromSequenceNumber?: string | undefined;
    } = { receiveMode: 'peek' },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    const receiveClient = this.getReceiver(
      receiveEndpoint,
      options.receiveMode === 'peek' ? 'peekLock' : 'receiveAndDelete',
    );
    const maxAmountOfMessagesToReceive =
      options.maxAmountOfMessagesToReceive ?? 1;
    const tokenBody = continuationToken
      ? this.decodeContinuationToken<ContinuationTokenBody>(continuationToken)
      : ({
          alreadyLoadedAmountOfMessages: 0,
          lastLoadedSequenceNumber: options.fromSequenceNumber ?? '0',
        } as ContinuationTokenBody);

    const fromSequenceNumber = options.fromSequenceNumber
      ? Long.fromString(options.fromSequenceNumber, true)
      : undefined;

    const currentFromSequenceNumber =
      tokenBody.alreadyLoadedAmountOfMessages > 0
        ? Long.fromString(tokenBody.lastLoadedSequenceNumber, true).add(
            Long.fromNumber(1),
          )
        : fromSequenceNumber;

    const currentMaxAmountOfMessagesToReceive =
      maxAmountOfMessagesToReceive - tokenBody.alreadyLoadedAmountOfMessages;

    let messages =
      options.receiveMode === 'peek'
        ? await receiveClient.peekMessages(maxAmountOfMessagesToReceive, {
            fromSequenceNumber: currentFromSequenceNumber,
          })
        : await receiveClient.receiveMessages(
            currentMaxAmountOfMessagesToReceive,
            { maxWaitTimeInMs: 100 },
          );

    messages = messages.filter((message) => message.body !== undefined);
    await receiveClient.close();

    const mappedMessages = messages.map((message) =>
      this.mapReceivedMessage(message),
    );
    const alreadyLoadedAmountOfMessages =
      tokenBody.alreadyLoadedAmountOfMessages + messages.length;
    const lastLoadedSequenceNumber =
      messages[messages.length - 1]?.sequenceNumber?.toString() ??
      tokenBody.lastLoadedSequenceNumber;

    const newContinuationToken =
       currentMaxAmountOfMessagesToReceive > mappedMessages.length
        ? this.makeContinuationToken({
            alreadyLoadedAmountOfMessages: alreadyLoadedAmountOfMessages,
            lastLoadedSequenceNumber: lastLoadedSequenceNumber,
          })
        : undefined;

    return {
      messages: mappedMessages,
      continuationToken: newContinuationToken,
    };
  }

  private makeContinuationToken<T>(tokenBody: T): string {
    const buf = Buffer.from(JSON.stringify(tokenBody), 'utf-8');
    return btoa(buf.toString('base64'));
  }

  private decodeContinuationToken<T>(
    continuationToken: string,
  ): T {
    const buf = Buffer.from(atob(continuationToken), 'base64');
    return JSON.parse(buf.toString('utf-8'));
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
            !['body', 'applicationProperties', '_rawAmqpMessage'].includes(key),
        )
        .filter(([_, value]) => value !== undefined && value !== null)
        .reduce(
          (acc, [key, value]) => {
            if (value instanceof Long) {
              value = value.toString();
            }
            acc[key] = value;
            return acc;
          },
          {} as Record<string, PropertyValue>,
        ),
      applicationProperties: message.applicationProperties,
    };
  }

  async clear(endpoint: ReceiveEndpoint, continuationToken?: string): Promise<{ continuationToken?: string }> {
    if (!endpoint) {
      throw new Error('endpoints is required for clearing messages');
    }
    let { zeroMessagesReceivedCounter } = continuationToken
      ? this.decodeContinuationToken<DeleteContinuationTokenBody>(
          continuationToken,
        )
      : ({ zeroMessagesReceivedCounter: 0 } as DeleteContinuationTokenBody);


    const receiver = this.getReceiver(endpoint, 'receiveAndDelete');
    const messages = await receiver.receiveMessages(250, { maxWaitTimeInMs: 300 });
    await receiver.close();

    if (messages.length === 0) {
      zeroMessagesReceivedCounter++;
    }

    if (zeroMessagesReceivedCounter >= 2) {
      return {};
    }

    const newToken = this.makeContinuationToken({ zeroMessagesReceivedCounter });
    return { continuationToken: newToken };
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
