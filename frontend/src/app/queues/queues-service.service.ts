import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { from, Observable } from 'rxjs';
import { serviceBusChannels } from '../../../../ipcModels/channels';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IQueue } from './ngrx/queues.models';

@Injectable({
  providedIn: 'root',
})
export class QueuesService {
  constructor(private log: LogService) {}

  public getQueues(connection: IConnection): Observable<IQueue[]> {
    this.log.logInfo(`Retreiving queues for connection '${connection.name}'`);

    var promise = new Promise<IQueue[]>((resolve, reject) => {
      ipcRenderer.once(
        serviceBusChannels.GET_QUEUES_RESPONSE,
        (event, ...args) => {
          const successfull = args[0];

          if (!successfull) {
            const reason = args[1];
            this.log.logWarning(`Retreiving queues failed: ${reason}`);
            reject(reason);
            return;
          }

          const queues = args[1] as IQueue[];
          this.log.logInfo(`Retreived ${queues.length} queues for '${connection.name}'`);
          resolve(queues);
        }
      );
    });

    ipcRenderer.send(serviceBusChannels.GET_QUEUES, connection);
    return from(promise);
  }
}
