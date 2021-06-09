import { Injectable } from '@angular/core';
import { ServiceBusMessage, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IMessage, MessagesChannel } from './ngrx/messages.models';
import * as Long from 'Long';

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
        `Retrieved ${messages.length} messages for '${connection.name}/${queueName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(
        `Retrieving messages for queue '${queueName}' failed: ${reason}`
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
        `Retrieved ${messages.length} messages for '${connection.name}/${topicName}/${subscriptionName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(
        `Retrieving messages for subscription '${topicName}/${subscriptionName}' failed: ${reason}`
      );
      throw reason;
    }
  }

  async clearQueueMessages(
    connection: IConnection,
    queueName: string,
    channel: MessagesChannel
  ): Promise<void> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(queueName, {
      receiveMode: 'receiveAndDelete',
      subQueueType: this.getSubQueueType(channel)
    });

    await this.clearReceiverMessages(receiver);

    await receiver.close();
    await client.close();
  }

  async clearSubscriptionMessages(
    connection: IConnection,
    topicName: string,
    subscriptionName: string,
    channel: MessagesChannel
  ): Promise<void> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(topicName, subscriptionName, {
      receiveMode: 'receiveAndDelete',
      subQueueType: this.getSubQueueType(channel)
    });

    await this.clearReceiverMessages(receiver);

    await receiver.close();
    await client.close();
  }

  async sendMessages(
    messages: IMessage[],
    connection: IConnection,
    queueOrTopicName: string
  ): Promise<void> {
    const client = this.connectionService.getClient(connection);
    const sender = client.createSender(queueOrTopicName);

    const serviceBusMessages = messages.map((m) => {
      const applicationProperties = {};
      for (const [key, value] of m.customProperties) {
        applicationProperties[key] = value;
      }

      return {
        subject: m.properties.subject,
        body: m.body,
        contentType: m.properties.contentType,
        applicationProperties: (Object as any).fromEntries(m.customProperties)
      } as ServiceBusMessage;
    });

    await sender.sendMessages(serviceBusMessages);

    await sender.close();
    await client.close();
  }

  private async clearReceiverMessages(receiver: ServiceBusReceiver): Promise<void> {
    this.log.logInfo(`Clearing messages for ${receiver.entityPath}`);

    let receivedMessages = [];
    do {
      receivedMessages = await receiver.receiveMessages(50, {
        maxWaitTimeInMs: 1000
      });
    } while (receivedMessages.length > 0);

    this.log.logInfo(`Cleared messages for ${receiver.entityPath} successfully`);
  }

  private async getQueuesMessagesInternal(
    connection: IConnection,
    queueName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(queueName, {
      subQueueType: this.getSubQueueType(channel)
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
      subQueueType: this.getSubQueueType(channel)
    });

    const messages: ServiceBusReceivedMessage[] = [];
    let lastLength = -1;

    while (messages.length < numberOfMessages && messages.length !== lastLength) {
      lastLength = messages.length;

      const messagesLeft = numberOfMessages - messages.length;
      const maxMessageCount = messagesLeft > 1000 ? 1000 : messagesLeft;

      const messagesPart = await receiver.peekMessages(maxMessageCount, {
        fromSequenceNumber: Long.fromNumber(messages.length)
      });

      messages.push(...messagesPart);

      const percentage = Math.round(messages.length / numberOfMessages * 10000) / 100;
      this.log.logInfo(`Loaded ${messages.length} of ${numberOfMessages} messages, ~${percentage}%`);
    }

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
      // tslint:disable-next-line:forin
      for (const key in m.applicationProperties) {
        const value = m.applicationProperties[key];
        message.customProperties.set(key, value);
      }
    }

    return message;
  }

  private getSubQueueType(channel: MessagesChannel): 'deadLetter' | 'transferDeadLetter' | undefined {
    switch (channel) {
      case MessagesChannel.deadletter:
        return 'deadLetter';
      case MessagesChannel.transferedDeadletters:
          return 'transferDeadLetter';
      default:
        return undefined;
    }
  }
}
