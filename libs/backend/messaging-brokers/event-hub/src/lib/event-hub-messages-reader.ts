import {
  EventHubConnection,
  MessagesReader,
  PropertyValue,
  ReceivedMessage,
  ReceiveEndpoint,
  ReceiveOptions,
} from '@service-bus-browser/api-contracts';
import {
  EventHubConsumerClient,
  ReceivedEventData,
  earliestEventPosition,
  EventPosition,
  Subscription,
} from '@azure/event-hubs';
import { getCredential } from './internal/credential-helper';
import { sequenceNumberToKey } from './internal/sequence-number-to-key';
import { withAmqpWebSocketFallback } from './internal/websocket-fallback';
import { IdleTimeoutConnectionCache } from '@service-bus-browser/backend-connection-cache';

type ContinuationTokenBody = {
  partitionOffsets: Record<string, string>;
  exhaustedPartitions: string[];
  partitionZeroCount: Record<string, number>;
  alreadyLoadedAmountOfMessages: number;
  usedWebSocket?: boolean;
};

// Keeps the underlying AMQP connection warm between pages so paging through a
// partition doesn't pay the connection-setup cost on every request. Idle timer
// resets on every use, so a connection is only closed after a minute of
// inactivity.
const CONNECTION_IDLE_TIMEOUT_MS = 60_000;

export class EventHubMessagesReader implements MessagesReader {
  private readonly clientCache = new IdleTimeoutConnectionCache<
    string,
    EventHubConsumerClient
  >({
    idleTimeoutMs: CONNECTION_IDLE_TIMEOUT_MS,
    createConnection: (key) => this.createClient(key),
    disposeConnection: (client) => client.close(),
  });

  constructor(private connection: EventHubConnection) {}

  /** Closes any cached connection immediately, e.g. when the connection config changes. */
  async dispose(): Promise<void> {
    await this.clientCache.clear();
  }

  private cacheKey(
    consumerGroup: string,
    eventHubName: string,
    useWebSocket: boolean,
  ): string {
    return `${consumerGroup} ${eventHubName} ${useWebSocket}`;
  }

  private createClient(cacheKey: string): EventHubConsumerClient {
    const [consumerGroup, eventHubName, useWebSocketFlag] =
      cacheKey.split(' ');
    const auth = getCredential(this.connection);
    return new EventHubConsumerClient(
      consumerGroup,
      auth.hostName,
      eventHubName,
      auth.credential,
      useWebSocketFlag === 'true'
        ? { webSocketOptions: { webSocket: WebSocket } }
        : undefined,
    );
  }

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: ReceiveOptions = { receiveMode: 'peek' },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    if (receiveEndpoint.target !== 'eventHub') {
      throw new Error('Invalid Event Hub receive endpoint');
    }

    const maxMessages = options.maxAmountOfMessagesToReceive ?? 10;
    const fromSequenceNumber = options['fromSequenceNumber'] as string | undefined;
    const tokenBody = continuationToken
      ? this.decodeContinuationToken<ContinuationTokenBody>(continuationToken)
      : ({ partitionOffsets: {}, exhaustedPartitions: [], partitionZeroCount: {}, alreadyLoadedAmountOfMessages: 0, usedWebSocket: false } as ContinuationTokenBody);

    const remainingMessages = maxMessages - tokenBody.alreadyLoadedAmountOfMessages;
    if (remainingMessages <= 0) {
      return { messages: [] };
    }

    return withAmqpWebSocketFallback(
      (useWebSocket) =>
        this.clientCache.get(
          this.cacheKey(
            receiveEndpoint.consumerGroup,
            receiveEndpoint.eventHubName,
            useWebSocket,
          ),
        ),
      async (clientPromise, useWebSocket) => {
        const client = await clientPromise;
        tokenBody.usedWebSocket = useWebSocket;
        const partitionIds = await client.getPartitionIds();
        const activePartitionIds = partitionIds.filter(
          (id) => !tokenBody.exhaustedPartitions.includes(id),
        );
        const perPartitionMax = Math.max(
          1,
          Math.ceil(
            remainingMessages / Math.max(1, activePartitionIds.length),
          ),
        );

        const allMessages: ReceivedMessage[] = [];

        for (const partitionId of activePartitionIds) {
          const remainingForCurrentRead =
            remainingMessages - allMessages.length;
          if (remainingForCurrentRead <= 0) {
            break;
          }

          const requestedCount = Math.min(
            perPartitionMax,
            remainingForCurrentRead,
          );
          const startingPosition = this.resolveStartingPosition(
            partitionId,
            tokenBody,
            fromSequenceNumber,
          );

          const events = await this.readFromPartition(
            client,
            partitionId,
            requestedCount,
            startingPosition,
          );

          for (const event of events) {
            allMessages.push(this.mapReceivedEvent(event, partitionId));
            tokenBody.partitionOffsets[partitionId] = event.offset;
          }

          if (events.length === 0) {
            const zeroCount =
              (tokenBody.partitionZeroCount[partitionId] ?? 0) + 1;
            tokenBody.partitionZeroCount[partitionId] = zeroCount;
            if (zeroCount >= 3) {
              tokenBody.exhaustedPartitions.push(partitionId);
            }
          } else {
            tokenBody.partitionZeroCount[partitionId] = 0;
          }
        }

        tokenBody.alreadyLoadedAmountOfMessages += allMessages.length;

        const allPartitionsExhausted = partitionIds.every((id) =>
          tokenBody.exhaustedPartitions.includes(id),
        );
        const shouldReturnContinuationToken =
          allMessages.length > 0 &&
          tokenBody.alreadyLoadedAmountOfMessages < maxMessages &&
          !allPartitionsExhausted;
        const newContinuationToken = shouldReturnContinuationToken
          ? this.makeContinuationToken(tokenBody)
          : undefined;

        return {
          messages: allMessages,
          continuationToken: newContinuationToken,
        };
      },
      { forceWebSocket: tokenBody.usedWebSocket },
    );
  }

  async cancelSession(
    _receiveEndpoint: ReceiveEndpoint,
    _continuationToken: string,
  ): Promise<void> {
    // Event Hub has no server-side temporary resources to clean up
  }

  async clear(
    _endpoint: ReceiveEndpoint,
    _continuationToken?: string,
  ): Promise<{ continuationToken?: string }> {
    // Event Hub does not support clearing — events are retained by the hub's retention policy
    return {};
  }

  private resolveStartingPosition(
    partitionId: string,
    tokenBody: ContinuationTokenBody,
    fromSequenceNumber?: string,
  ): EventPosition {
    if (tokenBody.partitionOffsets[partitionId] !== undefined) {
      return { offset: tokenBody.partitionOffsets[partitionId], isInclusive: false };
    }
    if (fromSequenceNumber) {
      return { sequenceNumber: parseInt(fromSequenceNumber, 10), isInclusive: true };
    }
    return earliestEventPosition;
  }

  private readFromPartition(
    client: EventHubConsumerClient,
    partitionId: string,
    maxEvents: number,
    startingPosition: EventPosition,
  ): Promise<ReceivedEventData[]> {
    return new Promise<ReceivedEventData[]>((resolve, reject) => {
      const collected: ReceivedEventData[] = [];
      let settled = false;

      const settle = (result: ReceivedEventData[] | Error) => {
        if (settled) return;
        settled = true;
        if (result instanceof Error) {
          subscription?.close().finally(() => reject(result));
        } else {
          subscription?.close().finally(() => resolve(result));
        }
      };

      const subscription: Subscription = client.subscribe(
        partitionId,
        {
          processEvents: async (events) => {
            for (const event of events) {
              collected.push(event);
            }
            settle(collected.slice(0, maxEvents));
          },
          processError: async (err) => {
            settle(err instanceof Error ? err : new Error(String(err)));
          },
        },
        {
          startPosition: startingPosition,
          maxBatchSize: maxEvents,
          maxWaitTimeInSeconds: 3,
        },
      );
    });
  }

  private mapReceivedEvent(event: ReceivedEventData, partitionId: string): ReceivedMessage {
    const raw = event.getRawAmqpMessage();

    let body: Uint8Array;
    if (event.body instanceof Uint8Array) {
      body = event.body;
    } else if (typeof event.body === 'object' && event.body !== null) {
      body = Buffer.from(JSON.stringify(event.body));
    } else {
      body = Buffer.from(String(event.body ?? ''));
    }

    return {
      key: `${partitionId}-${sequenceNumberToKey(event.sequenceNumber.toString())}`,
      messageId: event.messageId instanceof Buffer ? event.messageId.toString() : event.messageId?.toString(),
      body,
      contentType: event.contentType,
      sequence: String(event.sequenceNumber),
      headers: this.mapAmqpHeader(raw),
      deliveryAnnotations: this.mapDeliveryAnnotations(raw, partitionId),
      messageAnnotations: this.mapMessageAnnotations(raw),
      properties: this.mapAmqpProperties(raw),
      applicationProperties: this.mapApplicationProperties(raw),
    };
  }

  private mapAmqpHeader(raw: ReturnType<ReceivedEventData['getRawAmqpMessage']>) {
    const header = raw.header;
    if (!header) return undefined;

    const result: Record<string, PropertyValue> = {};
    const set = (key: string, value: unknown) => {
      if (value !== undefined && value !== null) result[key] = value as PropertyValue;
    };

    set('durable', header.durable);
    set('priority', header.priority);
    set('ttl', header.timeToLive);
    set('first-acquirer', header.firstAcquirer);
    set('delivery-count', header.deliveryCount);

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private mapAmqpProperties(raw: ReturnType<ReceivedEventData['getRawAmqpMessage']>) {
    const props = raw.properties;
    if (!props) return undefined;

    const result: Record<string, PropertyValue> = {};
    const set = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;
      result[key] = (value instanceof Buffer ? value.toString() : value) as PropertyValue;
    };

    set('message-id', props.messageId);
    set('to', props.to);
    set('subject', props.subject);
    set('reply-to', props.replyTo);
    set('correlation-id', props.correlationId);
    set('content-type', props.contentType);
    set('content-encoding', props.contentEncoding);
    set('absolute-expiry-time', props.absoluteExpiryTime);
    set('creation-time', props.creationTime);
    set('group-id', props.groupId);
    set('group-sequence', props.groupSequence);
    set('reply-to-group-id', props.replyToGroupId);

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private mapDeliveryAnnotations(
    raw: ReturnType<ReceivedEventData['getRawAmqpMessage']>,
    partitionId: string,
  ) {
    const annotations: Record<string, PropertyValue> = {
      ...(raw.deliveryAnnotations as Record<string, PropertyValue> | undefined),
      'x-opt-partition-id': partitionId,
    };
    return annotations;
  }

  private mapMessageAnnotations(raw: ReturnType<ReceivedEventData['getRawAmqpMessage']>) {
    const annotations = raw.messageAnnotations as Record<string, PropertyValue> | undefined;
    if (!annotations || Object.keys(annotations).length === 0) return undefined;
    return annotations;
  }

  private mapApplicationProperties(raw: ReturnType<ReceivedEventData['getRawAmqpMessage']>) {
    const props = raw.applicationProperties;
    if (!props) return undefined;

    const result: Record<string, PropertyValue> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && value !== null) {
        result[key] = value as PropertyValue;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  private makeContinuationToken<T>(tokenBody: T): string {
    const buf = Buffer.from(JSON.stringify(tokenBody), 'utf-8');
    return btoa(buf.toString('base64'));
  }

  private decodeContinuationToken<T>(continuationToken: string): T {
    const buf = Buffer.from(atob(continuationToken), 'base64');
    return JSON.parse(buf.toString('utf-8'));
  }
}
