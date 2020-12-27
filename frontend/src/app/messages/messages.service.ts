import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { IConnection, IMessage, MessagesChannel, servicebusQueuesChannels, servicebusTopicsChannels } from '../../../../ipcModels';
import { LogService } from '../logging/log.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(private log: LogService) {}

  getQueueMessages(connection: IConnection, queueName: string, numberOfMessages: number, deadletter: Boolean): Promise<IMessage[]> {
    var promise = new Promise<IMessage[]>((resolve, reject) => {
      ipcRenderer.once(
        servicebusQueuesChannels.GET_QUEUES_MESSAGES_RESPONSE,
        (event, ...args) => {
          const successfull = args[0];

          if (!successfull) {
            const reason = args[1];
            this.log.logWarning(`Retreiving messages for queue '${queueName}' failed: ${reason}`);
            reject(reason);
            return;
          }

          const messages = args[1] as IMessage[];
          this.log.logInfo(
            `Retreived ${messages.length} messages for '${connection.name}/${queueName}'`
          );
          resolve(messages);
        }
      );
    });
    ipcRenderer.send(
      servicebusQueuesChannels.GET_QUEUES_MESSAGES, 
      connection, 
      queueName,
      numberOfMessages,
      deadletter ? MessagesChannel.deadletter : MessagesChannel.regular
    );
    return promise;
  }

  getSubscriptionMessages(connection: IConnection, topicName: string, subscriptionName: string, numberOfMessages: number, deadletter: Boolean): Promise<IMessage[]> {
    var promise = new Promise<IMessage[]>((resolve, reject) => {
      ipcRenderer.once(
        servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_MESSAGES_RESPONSE(connection.id, topicName, subscriptionName),
        (event, ...args) => {
          const successfull = args[0];

          if (!successfull) {
            const reason = args[1];
            this.log.logWarning(`Retreiving messages for subscription '${topicName}/${subscriptionName}' failed: ${reason}`);
            reject(reason);
            return;
          }

          const messages = args[1] as IMessage[];
          this.log.logInfo(
            `Retreived ${messages.length} messages for '${connection.name}/${topicName}/${subscriptionName}'`
          );
          resolve(messages);
        }
      );
    });
    ipcRenderer.send(
      servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_MESSAGES, 
      connection, 
      topicName,
      subscriptionName,
      numberOfMessages,
      deadletter ? MessagesChannel.deadletter : MessagesChannel.regular
    );
    return promise;
  }
}
