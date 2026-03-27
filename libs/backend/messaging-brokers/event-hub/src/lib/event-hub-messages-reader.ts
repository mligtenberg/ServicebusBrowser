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

type ContinuationTokenBody = {
  partitionOffsets: Record<string, string>;
  alreadyLoadedAmountOfMessages: number;
};

export class EventHubMessagesReader implements MessagesReader {
  constructor(private connection: EventHubConnection) {}

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
      : ({ partitionOffsets: {}, alreadyLoadedAmountOfMessages: 0 } as ContinuationTokenBody);

    const auth = getCredential(this.connection);
    const client = new EventHubConsumerClient(
      receiveEndpoint.consumerGroup,
      auth.hostName,
      receiveEndpoint.eventHubName,
      auth.credential,
    );

    try {
      const partitionIds = await client.getPartitionIds();
      const perPartitionMax = Math.max(1, Math.ceil(maxMessages / partitionIds.length));

      const allMessages: ReceivedMessage[] = [];

      for (const partitionId of partitionIds) {
        const startingPosition = this.resolveStartingPosition(
          partitionId,
          tokenBody,
          fromSequenceNumber,
        );

        const events = await this.readFromPartition(
          client,
          partitionId,
          perPartitionMax,
          startingPosition,
        );

        for (const event of events) {
          allMessages.push(this.mapReceivedEvent(event, partitionId));
          tokenBody.partitionOffsets[partitionId] = event.offset;
        }
      }

      tokenBody.alreadyLoadedAmountOfMessages += allMessages.length;

      const newContinuationToken =
        allMessages.length > 0 ? this.makeContinuationToken(tokenBody) : undefined;

      return {
        messages: allMessages,
        continuationToken: newContinuationToken,
      };
    } finally {
      await client.close();
    }
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
      let subscription: Subscription | undefined;
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

      subscription = client.subscribe(
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
    const applicationProperties: Record<string, PropertyValue> = {};
    if (event.properties) {
      for (const [key, value] of Object.entries(event.properties)) {
        if (value !== undefined && value !== null) {
          applicationProperties[key] = value as PropertyValue;
        }
      }
    }

    const deliveryAnnotations: Record<string, PropertyValue> = {
      'x-opt-partition-id': partitionId,
      'x-opt-sequence-number': event.sequenceNumber,
      'x-opt-offset': event.offset,
      'x-opt-enqueued-time': event.enqueuedTimeUtc.toISOString(),
    };

    if (event.partitionKey) {
      deliveryAnnotations['x-opt-partition-key'] = event.partitionKey;
    }

    let body: Uint8Array;
    if (event.body instanceof Uint8Array) {
      body = event.body;
    } else if (typeof event.body === 'object' && event.body !== null) {
      body = Buffer.from(JSON.stringify(event.body));
    } else {
      body = Buffer.from(String(event.body ?? ''));
    }

    const messageId =
      event.messageId instanceof Buffer
        ? event.messageId.toString()
        : event.messageId?.toString();

    const correlationId =
      event.correlationId instanceof Buffer
        ? event.correlationId.toString()
        : event.correlationId?.toString();

    return {
      key: `${partitionId}-${event.sequenceNumber}`,
      messageId,
      body,
      contentType: event.contentType,
      sequence: String(event.sequenceNumber),
      headers: undefined,
      deliveryAnnotations,
      messageAnnotations: undefined,
      properties: {
        'correlation-id': correlationId,
        'content-type': event.contentType,
      },
      applicationProperties:
        Object.keys(applicationProperties).length > 0 ? applicationProperties : undefined,
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
}
