import {
  Message,
  MessagesSender,
  SendEndpoint,
  ServiceBusConnection,
} from '@service-bus-browser/api-contracts';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { AmqpAnnotatedMessage } from '@azure/core-amqp';
import { Duration } from 'luxon';
import { getCredential } from './internal/credential-helper';

export class ServiceBusMessagesSender implements MessagesSender {
  constructor(private connection: ServiceBusConnection) {}

  async send(endpoint: SendEndpoint, message: Message): Promise<void> {
    const sender = this.getSender(endpoint);
    await sender.sendMessages(this.mapMessage(message));
    await sender.close();
  }

  async sendBatch(endpoint: SendEndpoint, messages: Message[]): Promise<void> {
    const sender = this.getSender(endpoint);
    let batch = await sender.createMessageBatch();

    while (messages.length > 0) {
      const message = messages.shift();
      if (!message) {
        continue;
      }

      if (!batch.tryAddMessage(this.mapMessage(message))) {
        await sender.sendMessages(batch);
        batch = await sender.createMessageBatch();
        batch.tryAddMessage(this.mapMessage(message));
      }
    }

    await sender.sendMessages(batch);

    await sender.close();
  }

  mapMessage(message: Message): AmqpAnnotatedMessage {
    const timeToLive = message.headers?.['ttl'];

    const duration =
      timeToLive && typeof timeToLive === 'string'
        ? Duration.fromISO(timeToLive)
        : null;
    const parsedTimeToLive = duration ? duration.as('milliseconds') : undefined;

    const header = {
      durable: message.headers?.['durable'],
      priority: message.headers?.['priority'],
      ttl: parsedTimeToLive ?? message.headers?.['ttl'],
      firstAcquirer: message.headers?.['first-acquirer'],
      deliveryCount: message.headers?.['delivery-count'],
    } as AmqpAnnotatedMessage['header'];

    const properties = {
      messageId: message.properties?.['message-id'] ?? message.messageId,
      userId: this.toBuffer(message.properties?.['user-id']),
      to: message.properties?.['to'],
      subject: message.properties?.['subject'],
      replyTo: message.properties?.['reply-to'],
      correlationId: this.toBuffer(message.properties?.['correlation-id']),
      contentType: message.properties?.['content-type'] ?? message.contentType,
      contentEncoding: message.properties?.['content-encoding'],
      absoluteExpiryTime: this.toEpochMs(
        message.properties?.['absolute-expiry-time'],
      ),
      creationTime: this.toEpochMs(message.properties?.['creation-time']),
      groupId: message.properties?.['group-id'],
      groupSequence: message.properties?.['group-sequence'],
      replyToGroupId: message.properties?.['reply-to-group-id'],
    } as AmqpAnnotatedMessage['properties'];

    return {
      body: message.body.buffer,
      header,
      properties,
      deliveryAnnotations: message.deliveryAnnotations,
      messageAnnotations: message.messageAnnotations,
      applicationProperties: message.applicationProperties,
    };
  }

  private toBuffer(
    value: string | number | Uint8Array | undefined,
  ): Buffer | string | number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return Buffer.from(value);
  }

  private toEpochMs(value: Date | undefined): number | undefined {
    return value ? value.getTime() : undefined;
  }

  private getSender(endpoint: SendEndpoint): ServiceBusSender {
    const auth = getCredential(this.connection);
    const client = new ServiceBusClient(auth.hostName, auth.credential);

    if (endpoint.type === 'queue') {
      return client.createSender(endpoint.queueName);
    }

    return client.createSender(endpoint.topicName);
  }
}
