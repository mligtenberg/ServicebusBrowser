import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import * as contracts from '@service-bus-browser/messages-contracts';

export class MessageReceiveClient {
  constructor(private connection: Connection, private endpoint: { queueName: string; } | { topicName: string; subscriptionName: string; })
  {}

  async peakMessages(maxMessageCount: number, fromSequenceNumber?: bigint) {
    const receiver = this.getReceiver();
    const messages = await receiver.peekMessages(maxMessageCount, {
      fromSequenceNumber: fromSequenceNumber ?? 0
    });

    return messages.map(this.mapMessage);
  }

  async receiveMessages(maxMessageCount: number) {

      const receiver = this.getReceiver();
      const messages = await receiver.receiveMessages(maxMessageCount, {
        maxWaitTimeInMs: 200
      });

      return messages.map(this.mapMessage);
  }

  private getReceiver(): ServiceBusReceiver {
    let client: ServiceBusClient | undefined = undefined;
    if (this.connection.type === "connectionString") {
      client = new ServiceBusClient(this.connection.connectionString);
    }

    if (client === undefined) {
      throw new Error('Unsupported connection type');
    }

    if ('queueName' in this.endpoint) {
      return client.createReceiver(this.endpoint.queueName);
    }

    return client.createReceiver(this.endpoint.topicName, this.endpoint.subscriptionName);
  }

  private mapMessage(message: ServiceBusReceivedMessage): contracts.ServiceBusReceivedMessage {
    const mappedMessageId: string | number | undefined  = message.messageId instanceof Buffer
      ? message.messageId.toString('utf-8')
      : message.messageId;

    const mappedCorrelationId: string | number | undefined = message.correlationId instanceof Buffer
      ? message.correlationId.toString('utf-8')
      : message.correlationId;

    return {
      messageId: mappedMessageId,
      body: message.body,
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
      timeToLive: message.timeToLive,
      state: message.state,
      lockedUntilUtc: message.lockedUntilUtc,
      sequenceNumber: message.sequenceNumber,
      enqueuedSequenceNumber: message.enqueuedSequenceNumber,
    };
  }
}
