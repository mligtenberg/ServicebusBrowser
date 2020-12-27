import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { IConnection, IMessage, MessagesChannel, servicebusQueuesChannels } from '../../../../ipcModels';
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
}
