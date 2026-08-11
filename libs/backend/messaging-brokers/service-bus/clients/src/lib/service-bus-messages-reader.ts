import {
  MessagesReader,
  PropertyValue,
  ReceivedMessage,
  ReceiveEndpoint,
  ServiceBusConnection,
} from '@service-bus-browser/api-contracts';
import Long from 'long';
import {
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from '@azure/service-bus';
import { sequenceNumberToKey } from './internal/sequence-number-to-key';
import { getCredential } from './internal/credential-helper';
import { withAmqpWebSocketFallback } from './internal/websocket-fallback';
import { IdleTimeoutConnectionCache } from '@service-bus-browser/backend-connection-cache';

type ContinuationTokenBody = {
  lastLoadedSequenceNumber: string;
  alreadyLoadedAmountOfMessages: number;
  usedWebSocket?: boolean;
};

type DeleteContinuationTokenBody = {
  zeroMessagesReceivedCounter: number;
  usedWebSocket?: boolean;
};

// Keeps the underlying AMQP connection warm between pages so paging through a
// queue doesn't pay the connection-setup cost on every request. Idle timer
// resets on every use, so a connection is only closed after a minute of
// inactivity.
const CONNECTION_IDLE_TIMEOUT_MS = 60_000;

export class ServiceBusMessagesReader implements MessagesReader {
  private readonly clientCache = new IdleTimeoutConnectionCache<
    boolean,
    ServiceBusClient
  >({
    idleTimeoutMs: CONNECTION_IDLE_TIMEOUT_MS,
    createConnection: (useWebSocket) => this.createClient(useWebSocket),
    disposeConnection: (client) => client.close(),
  });

  constructor(private connection: ServiceBusConnection) {}

  /** Closes any cached connection immediately, e.g. when the connection config changes. */
  async dispose(): Promise<void> {
    await this.clientCache.clear();
  }

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
      fromSequenceNumber?: string | undefined;
    } = { receiveMode: 'peek' },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    const receiveMode =
      options.receiveMode === 'peek' ? 'peekLock' : 'receiveAndDelete';
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

    let usedWebSocket = tokenBody.usedWebSocket ?? false;

    let messages = await withAmqpWebSocketFallback(
      (useWebSocket) => this.getReceiver(receiveEndpoint, receiveMode, useWebSocket),
      async (receiverPromise, useWebSocket) => {
        const { receiver: receiveClient } = await receiverPromise;
        const received =
          options.receiveMode === 'peek'
            ? await receiveClient.peekMessages(maxAmountOfMessagesToReceive, {
                fromSequenceNumber: currentFromSequenceNumber,
              })
            : await receiveClient.receiveMessages(
                currentMaxAmountOfMessagesToReceive,
                { maxWaitTimeInMs: 100 },
              );

        await receiveClient.close();
        usedWebSocket = useWebSocket;
        return received;
      },
      { forceWebSocket: tokenBody.usedWebSocket },
    );

    messages = messages.filter((message) => message.body !== undefined);

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
            usedWebSocket,
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

  private decodeContinuationToken<T>(continuationToken: string): T {
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
      headers: this.mapAmqpHeader(message),
      deliveryAnnotations: this.mapDeliveryAnnotations(message),
      messageAnnotations: this.mapMessageAnnotations(message),
      properties: this.mapAmqpProperties(message),
      applicationProperties: message.applicationProperties,
    };
  }

  async cancelSession(
    _receiveEndpoint: ReceiveEndpoint,
    _continuationToken: string,
  ): Promise<void> {
    // Service Bus has no server-side temporary resources to clean up
  }

  async clear(
    endpoint: ReceiveEndpoint,
    continuationToken?: string,
  ): Promise<{ continuationToken?: string }> {
    if (!endpoint) {
      throw new Error('endpoints is required for clearing messages');
    }
    const decodedToken = continuationToken
      ? this.decodeContinuationToken<DeleteContinuationTokenBody>(
          continuationToken,
        )
      : ({ zeroMessagesReceivedCounter: 0 } as DeleteContinuationTokenBody);
    let { zeroMessagesReceivedCounter } = decodedToken;
    let usedWebSocket = decodedToken.usedWebSocket ?? false;

    const messages = await withAmqpWebSocketFallback(
      (useWebSocket) => this.getReceiver(endpoint, 'receiveAndDelete', useWebSocket),
      async (receiverPromise, useWebSocket) => {
        const { receiver } = await receiverPromise;
        const received = await receiver.receiveMessages(250, {
          maxWaitTimeInMs: 300,
        });
        await receiver.close();
        usedWebSocket = useWebSocket;
        return received;
      },
      { forceWebSocket: decodedToken.usedWebSocket },
    );

    if (messages.length === 0) {
      zeroMessagesReceivedCounter++;
    }

    if (zeroMessagesReceivedCounter >= 2) {
      return {};
    }

    const newToken = this.makeContinuationToken({
      zeroMessagesReceivedCounter,
      usedWebSocket,
    });
    return { continuationToken: newToken };
  }

  private mapAmqpHeader(message: ServiceBusReceivedMessage) {
    const raw = message._rawAmqpMessage;
    const header = raw?.header;
    if (!header) {
      return undefined;
    }

    const amqpHeader: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined && value !== null) {
        amqpHeader[key] = value as PropertyValue;
      }
    };

    setIfDefined('durable', header.durable);
    setIfDefined('priority', header.priority);
    setIfDefined('ttl', header.timeToLive);
    setIfDefined('first-acquirer', header.firstAcquirer);
    setIfDefined('delivery-count', header.deliveryCount);

    return Object.keys(amqpHeader).length > 0 ? amqpHeader : undefined;
  }

  private mapAmqpProperties(message: ServiceBusReceivedMessage) {
    const raw = message._rawAmqpMessage;
    const properties = raw?.properties;
    if (!properties) {
      return undefined;
    }

    const amqpProperties: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value === undefined || value === null) {
        return;
      }

      if (value instanceof Long) {
        amqpProperties[key] = value.toString();
        return;
      }

      amqpProperties[key] = value as PropertyValue;
    };

    setIfDefined('message-id', properties['messageId']);
    setIfDefined('to', properties['to']);
    setIfDefined('subject', properties['subject']);
    setIfDefined('reply-to', properties['replyTo']);
    setIfDefined('correlation-id', properties['correlationId']);
    setIfDefined('content-type', properties['contentType']);
    setIfDefined('content-encoding', properties['contentEncoding']);
    setIfDefined('absolute-expiry-time', properties['absoluteExpiryTime']);
    setIfDefined('creation-time', properties['creationTime']);
    setIfDefined('group-id', properties['groupId']);
    setIfDefined('group-sequence', properties['groupSequence']);
    setIfDefined('reply-to-group-id', properties['replyToGroupId']);

    return Object.keys(amqpProperties).length > 0 ? amqpProperties : undefined;
  }

  private mapDeliveryAnnotations(message: ServiceBusReceivedMessage) {
    const raw = message._rawAmqpMessage.deliveryAnnotations as
      | {
          deliveryAnnotations?: Record<string, PropertyValue>;
        }
      | undefined;
    return raw?.deliveryAnnotations ?? undefined;
  }

  private mapMessageAnnotations(message: ServiceBusReceivedMessage) {
    const raw = message._rawAmqpMessage as
      | {
          messageAnnotations?: Record<string, PropertyValue>;
        }
      | undefined;
    return raw?.messageAnnotations ?? undefined;
  }

  private createClient(useWebSocket: boolean): ServiceBusClient {
    const auth = getCredential(this.connection);
    return new ServiceBusClient(
      auth.hostName,
      auth.credential,
      useWebSocket ? { webSocketOptions: { webSocket: WebSocket } } : undefined,
    );
  }

  private async getReceiver(
    endpoint: ReceiveEndpoint,
    receiveMode: 'peekLock' | 'receiveAndDelete',
    useWebSocket: boolean,
  ): Promise<{ client: ServiceBusClient; receiver: ServiceBusReceiver }> {
    if (endpoint.target !== 'serviceBus') {
      throw new Error('Invalid Service Bus receive endpoint');
    }

    const client = await this.clientCache.get(useWebSocket);

    if ('queueName' in endpoint) {
      return {
        client,
        receiver: client.createReceiver(endpoint.queueName, {
          receiveMode,
          subQueueType: endpoint.channel,
          skipParsingBodyAsJson: true,
        }),
      };
    }

    return {
      client,
      receiver: client.createReceiver(
        endpoint.topicName,
        endpoint.subscriptionName,
        {
          receiveMode: receiveMode,
          subQueueType: endpoint.channel,
          skipParsingBodyAsJson: true,
        },
      ),
    };
  }
}
