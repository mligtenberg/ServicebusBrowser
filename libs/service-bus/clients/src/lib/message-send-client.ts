import * as contracts from '@service-bus-browser/messages-contracts';
import { Connection, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusClient, ServiceBusMessage, ServiceBusSender } from '@azure/service-bus';
import { Duration } from 'luxon';

export class MessageSendClient {
  constructor(private readonly connection: Connection, private readonly endpoint: SendEndpoint) {}

  async send(message: contracts.ServiceBusMessage): Promise<void> {
    const mappedMessage = this.mapMessage(message);
    const sender = this.getSender();
    await sender.sendMessages(mappedMessage);
  }

  mapMessage(message: contracts.ServiceBusMessage): ServiceBusMessage {
    const duration = message.timeToLive ? Duration.fromISO(message.timeToLive) : null;
    const timeToLive = duration ? duration.as('milliseconds') : undefined;
    const encoder = new TextEncoder();

    return {
      body: encoder.encode(message.body ?? ''),
      messageId: message.messageId,
      correlationId: message.correlationId,
      contentType: message.contentType,
      partitionKey: message.partitionKey,
      replyTo: message.replyTo,
      replyToSessionId: message.replyToSessionId,
      sessionId: message.sessionId,
      timeToLive: timeToLive,
      to: message.to,
      subject: message.subject,
      applicationProperties: message.applicationProperties,
      scheduledEnqueueTimeUtc: message.scheduledEnqueueTimeUtc,
    };
  }

  private getSender(): ServiceBusSender {
    let client: ServiceBusClient | undefined = undefined;
    if (this.connection.type === "connectionString") {
      client = new ServiceBusClient(this.connection.connectionString);
    }

    if (client === undefined) {
      throw new Error('Unsupported connection type');
    }


    if ('queueName' in this.endpoint) {
      return client.createSender(this.endpoint.queueName);
    }

    return client.createSender(this.endpoint.topicName);
  }
}
