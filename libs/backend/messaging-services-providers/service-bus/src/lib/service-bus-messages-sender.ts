import {
  Connection,
  Message,
  MessagesSender,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import {
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusSender,
} from '@azure/service-bus';
import { Duration } from 'luxon';
import { getCredential } from './internal/credential-helper';

export class ServiceBusMessagesSender implements MessagesSender {
  constructor(private connection: Connection) {}

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

  mapMessage(message: Message): ServiceBusMessage {
    const timeToLive = message.systemProperties?.['timeToLive'];

    const duration =
      timeToLive && typeof timeToLive === 'string'
        ? Duration.fromISO(timeToLive)
        : null;
    const parsedTimeToLive = duration ? duration.as('milliseconds') : undefined;

    return {
      body: message.body,
      messageId: message.messageId,
      correlationId:
        (message.systemProperties?.['correlationId'] as string) ?? undefined,
      contentType: message.contentType,
      partitionKey:
        (message.systemProperties?.['partitionKey'] as string) ?? undefined,
      replyTo: (message.systemProperties?.['replyTo'] as string) ?? undefined,
      replyToSessionId:
        (message.systemProperties?.['replyToSessionId'] as string) ?? undefined,
      sessionId:
        (message.systemProperties?.['sessionId'] as string) ?? undefined,
      timeToLive: parsedTimeToLive,
      to: (message.systemProperties?.['to'] as string) ?? undefined,
      subject: (message.systemProperties?.['subject'] as string) ?? undefined,
      applicationProperties: message.applicationProperties,
      scheduledEnqueueTimeUtc:
        (message.systemProperties?.['scheduledEnqueueTimeUtc'] as Date) ??
        undefined,
    };
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
