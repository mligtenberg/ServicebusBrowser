import { Connection, ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import * as contracts from '@service-bus-browser/messages-contracts';
import Long from 'long';
import { Duration } from 'luxon';

export class MessageReceiveClient {
  constructor(private connection: Connection, private endpoint: ReceiveEndpoint)
  {}

  async peakMessages(maxMessageCount: number, fromSequenceNumber?: Long) {
    const receiver = this.getReceiver('peekLock');
    const messages = await receiver.peekMessages(maxMessageCount, {
      fromSequenceNumber: fromSequenceNumber ?? Long.fromNumber(0)
    });

    return messages.map(this.mapMessage);
  }

  async receiveMessages(maxMessageCount: number) {

      const receiver = this.getReceiver('receiveAndDelete');
      const messages = await receiver.receiveMessages(maxMessageCount, {
        maxWaitTimeInMs: 100
      });

      return messages.map(this.mapMessage);
  }

  private getReceiver(receiveMode: "peekLock" | "receiveAndDelete"): ServiceBusReceiver {
    let client: ServiceBusClient | undefined = undefined;
    if (this.connection.type === "connectionString") {
      client = new ServiceBusClient(this.connection.connectionString);
    }

    if (client === undefined) {
      throw new Error('Unsupported connection type');
    }

    if ('queueName' in this.endpoint) {
      return client.createReceiver(this.endpoint.queueName, {
        receiveMode,
        subQueueType: this.endpoint.channel,
        skipParsingBodyAsJson: true
      });
    }

    return client.createReceiver(
      this.endpoint.topicName,
      this.endpoint.subscriptionName, {
        receiveMode: "receiveAndDelete",
        subQueueType: this.endpoint.channel
      });
  }

  private mapMessage(message: ServiceBusReceivedMessage): contracts.ServiceBusReceivedMessage {
    const mappedMessageId: string | number | undefined  = message.messageId instanceof Buffer
      ? message.messageId.toString('utf-8')
      : message.messageId;

    const mappedCorrelationId: string | number | undefined = message.correlationId instanceof Buffer
      ? message.correlationId.toString('utf-8')
      : message.correlationId;

    const body = message.body instanceof Uint8Array
      ? Buffer.from(message.body).toString('utf-8')
      : message.body;

    return {
      messageId: mappedMessageId,
      body: body,
      applicationProperties: message.applicationProperties,
      contentType: message.contentType,
      correlationId: mappedCorrelationId,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      sessionId: message.sessionId,
      replyToSessionId: message.replyToSessionId,
      deadLetterErrorDescription: message.deadLetterErrorDescription,
      deadLetterReason: message.deadLetterReason,
      deliveryCount: message.deliveryCount,
      deadLetterSource: message.deadLetterSource,
      enqueuedTimeUtc: message.enqueuedTimeUtc,
      expiresAtUtc: message.expiresAtUtc,
      partitionKey: message.partitionKey,
      lockToken: message.lockToken,
      scheduledEnqueueTimeUtc: message.scheduledEnqueueTimeUtc,
      timeToLive: message.timeToLive ? Duration.fromObject({ minutes: message.timeToLive }).toISO() : undefined,
      state: message.state,
      lockedUntilUtc: message.lockedUntilUtc,
      sequenceNumber: message.sequenceNumber?.toString(),
      enqueuedSequenceNumber: message.enqueuedSequenceNumber,
    };
  }
}
