import { Injectable } from '@angular/core';
import { IConnection, IMessage, MessagesChannel } from '../../../../ipcModels';
import { ConnectionService } from '../connections/connection.service';
import { LogService } from '../logging/log.service';
@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(
    private connectionService: ConnectionService,
    private log: LogService
  ) {}

  async getQueueMessages(connection: IConnection, queueName: string, numberOfMessages: number, channel: MessagesChannel): Promise<IMessage[]> {
    try {
      const messages = await this.getQueuesMessagesInternal(connection, queueName, numberOfMessages, channel);
      this.log.logInfo(
        `Retreived ${messages.length} messages for '${connection.name}/${queueName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(`Retreiving messages for queue '${queueName}' failed: ${reason}`);
      throw reason;
    }
  }

  async getSubscriptionMessages(connection: IConnection, topicName: string, subscriptionName: string, numberOfMessages: number, channel: MessagesChannel): Promise<IMessage[]> {
    try {
      const messages = await this.getSubscriptionMessagesInternal(connection, topicName, subscriptionName, numberOfMessages, channel);
      this.log.logInfo(
        `Retreived ${messages.length} messages for '${connection.name}/${topicName}/${subscriptionName}'`
      );
      return messages;
    } catch (reason) {
      this.log.logWarning(`Retreiving messages for subscription '${topicName}/${subscriptionName}' failed: ${reason}`);
      throw reason;
    }
  }

  private async getQueuesMessagesInternal(
    connection: IConnection,
    queueName: string,
    numberOfMessages: number,
    channel: MessagesChannel
  ): Promise<IMessage[]> {
    const client = this.connectionService.getClient(connection);
    const receiver = client.createReceiver(queueName, {
      subQueueType: channel === MessagesChannel.deadletter ? 'deadLetter' : undefined
    });
    
    const messages = await receiver.peekMessages(numberOfMessages);
  
    receiver.close();
    client.close();
  
    return messages.map((m) => {
      const message = {
        id: m.messageId,
        subject: m.subject,
        body: `${m.body}`,
        properties: new Map<string, string>(),
        customProperties: new Map<string, string>(),
      } as IMessage;
  
      message.properties.set("ContentType", m.contentType ?? "");
      message.properties.set("correlationId", m.correlationId?.toString() ?? "");
  
      for (const propertyName in m._rawAmqpMessage.deliveryAnnotations) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.deliveryAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.properties) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.properties as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.messageAnnotations) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.footer) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m.applicationProperties) {
        message.customProperties.set(
          propertyName,
          m.applicationProperties[propertyName].toString()
        );
      }
  
      return message;
    });
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
      subQueueType: channel === MessagesChannel.deadletter ? 'deadLetter' : undefined
    });
    const messages = await receiver.peekMessages(numberOfMessages);
  
    receiver.close();
    client.close();
  
    return messages.map((m) => {
      const message = {
        id: m.messageId,
        subject: m.subject,
        body: new TextDecoder("utf-8").decode(m.body),
        properties: new Map<string, string>(),
        customProperties: new Map<string, string>(),
      } as IMessage;
  
      message.properties.set("ContentType", m.contentType ?? "");
      message.properties.set("correlationId", m.correlationId?.toString() ?? "");
  
      for (const propertyName in m._rawAmqpMessage.deliveryAnnotations) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.deliveryAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.properties) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.properties as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.messageAnnotations) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m._rawAmqpMessage.footer) {
        message.properties.set(
          propertyName,
          (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
        );
      }
  
      for (const propertyName in m.applicationProperties) {
        message.customProperties.set(
          propertyName,
          m.applicationProperties[propertyName].toString()
        );
      }
  
      return message;
    });
  }  
}
