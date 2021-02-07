import { Injectable } from '@angular/core';
import { ServiceBusMessage, ServiceBusReceivedMessage } from '@azure/service-bus';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IMessage, MessagesChannel } from './ngrx/messages.models';
@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(
    private connectionService: ConnectionService,
    private log: LogService
  ) {}

  async getQueueMessages(
    connection: IConnection,
    queueName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    try {
      const messages = await this.getQueuesMessagesInternal(
        connection,
        queueName,
        numberOfMessages,
        channel
      );
      this.log.logInfo(
        `Retreived ${messages.length} messages for '${connection.name}/${queueName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(
        `Retreiving messages for queue '${queueName}' failed: ${reason}`
      );
      throw reason;
    }
  }

  async getSubscriptionMessages(
    connection: IConnection,
    topicName: string,
    subscriptionName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    try {
      const messages = await this.getSubscriptionMessagesInternal(
        connection,
        topicName,
        subscriptionName,
        numberOfMessages,
        channel
      );
      this.log.logInfo(
        `Retreived ${messages.length} messages for '${connection.name}/${topicName}/${subscriptionName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(
        `Retreiving messages for subscription '${topicName}/${subscriptionName}' failed: ${reason}`
      );
      throw reason;
    }
  }

  async sendMessages(
    messages: IMessage[],
    connection: IConnection,
    queueOrTopicName: string
  ) {
    const client = this.connectionService.getClient(connection);
    const sender = client.createSender(queueOrTopicName);

    const serviceBusMessages = messages.map((m) => {
      const applicationProperties = {};
      for (const [key, value] of m.customProperties) {
        applicationProperties[key] = value;
      }

      const message = {
        subject: m.properties.subject,
        body: m.body,
        contentType: m.properties.contentType,
        applicationProperties: (Object as any).fromEntries(m.customProperties)
      } as ServiceBusMessage;

      return message;
    });

    await sender.sendMessages(serviceBusMessages);

    await sender.close();
    await client.close();
  }

  private async getQueuesMessagesInternal(
    connection: IConnection,
    queueName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(queueName, {
      subQueueType:
        channel === MessagesChannel.deadletter ? 'deadLetter' : undefined,
    });

    const messages = await receiver.peekMessages(numberOfMessages);

    await receiver.close();
    await client.close();

    return messages.map(m => this.mapMessage(m));
  }

  private async getSubscriptionMessagesInternal(
    connection: IConnection,
    topicName: string,
    subscriptionName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(topicName, subscriptionName, {
      subQueueType:
        channel === MessagesChannel.deadletter ? 'deadLetter' : undefined,
    });
    const messages = await receiver.peekMessages(numberOfMessages);

    await receiver.close();
    await client.close();

    return messages.map(m => this.mapMessage(m));
  }

  private mapMessage(m: ServiceBusReceivedMessage): IMessage {
    const message = {
      id: m.messageId?.toString(),
      body: `${m.body}`,
      properties: {
        contentType: m.contentType ?? '',
        correlationId: m.correlationId?.toString(),
        enqueueSequenceNumber: m.enqueuedSequenceNumber as number,
        enqueueTime: m.enqueuedTimeUtc,
        messageId: m.messageId?.toString(),
        sequenceNumber: m.sequenceNumber,
        subject: m.subject
      },
      customProperties: new Map<string, string | number | boolean | Date>()
    };

    if (m.applicationProperties) {
      for (const key in m.applicationProperties) {
        const value = m.applicationProperties[key];
        message.customProperties.set(key, value)
      }
    }

    return message;
  }
}
