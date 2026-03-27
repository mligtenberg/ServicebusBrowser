import {
  EventHubConnection,
  Message,
  MessagesSender,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { EventHubProducerClient, EventData } from '@azure/event-hubs';
import { getCredential } from './internal/credential-helper';

export class EventHubMessagesSender implements MessagesSender {
  constructor(private connection: EventHubConnection) {}

  async send(endpoint: SendEndpoint, message: Message): Promise<void> {
    if (endpoint.target !== 'eventHub') {
      throw new Error("Endpoint target must be 'eventHub'");
    }

    const auth = getCredential(this.connection);
    const producer = new EventHubProducerClient(
      auth.hostName,
      endpoint.eventHubName,
      auth.credential,
    );

    try {
      const eventData = this.mapMessage(message);
      const partitionKey = message.messageAnnotations?.['partitionKey'] as string | undefined;
      const batch = await producer.createBatch(partitionKey ? { partitionKey } : {});
      batch.tryAdd(eventData);
      await producer.sendBatch(batch);
    } finally {
      await producer.close();
    }
  }

  async sendBatch(endpoint: SendEndpoint, messages: Message[]): Promise<void> {
    if (endpoint.target !== 'eventHub') {
      throw new Error("Endpoint target must be 'eventHub'");
    }

    const auth = getCredential(this.connection);
    const producer = new EventHubProducerClient(
      auth.hostName,
      endpoint.eventHubName,
      auth.credential,
    );

    try {
      const remaining = [...messages];

      while (remaining.length > 0) {
        const firstMessage = remaining[0];
        const partitionKey = firstMessage.messageAnnotations?.['partitionKey'] as
          | string
          | undefined;

        const batch = await producer.createBatch(partitionKey ? { partitionKey } : {});

        while (remaining.length > 0) {
          const message = remaining[0];
          const eventData = this.mapMessage(message);
          if (!batch.tryAdd(eventData)) {
            break;
          }
          remaining.shift();
        }

        await producer.sendBatch(batch);
      }
    } finally {
      await producer.close();
    }
  }

  private mapMessage(message: Message): EventData {
    const body = Buffer.from(message.body.buffer, message.body.byteOffset, message.body.byteLength);

    const properties: Record<string, unknown> = {};
    if (message.applicationProperties) {
      for (const [key, value] of Object.entries(message.applicationProperties)) {
        if (value !== undefined && value !== null) {
          properties[key] = value;
        }
      }
    }

    const correlationId = message.properties?.['correlation-id'];
    const contentType = message.properties?.['content-type'] ?? message.contentType;

    return {
      body,
      messageId: message.messageId,
      correlationId: correlationId !== undefined ? String(correlationId) : undefined,
      contentType: contentType !== undefined ? String(contentType) : undefined,
      properties: Object.keys(properties).length > 0 ? properties : undefined,
    };
  }
}
