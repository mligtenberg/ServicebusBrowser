import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { from, Observable } from 'rxjs';
import { servicebusTopicsChannels } from '../../../../ipcModels';
import { IConnection } from '../../../../ipcModels/IConnection';
import { LogService } from '../logging/log.service';
import { ITopic } from './ngrx/topics.models';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {

  constructor(private log: LogService) {}

  public getTopics(connection: IConnection): Observable<ITopic[]> {
    this.log.logInfo(`Retreiving topics for connection '${connection.name}'`);

    var promise = new Promise<ITopic[]>((resolve, reject) => {
      ipcRenderer.once(
        servicebusTopicsChannels.GET_TOPICS_REPONSE,
        (event, ...args) => {
          const successfull = args[0];

          if (!successfull) {
            const reason = args[1];
            this.log.logWarning(`Retreiving topics failed: ${reason}`);
            reject(reason);
            return;
          }

          const topics = args[1] as ITopic[];
          this.log.logInfo(`Retreived ${topics.length} topics for '${connection.name}'`);
          resolve(topics);
        }
      );
    });

    ipcRenderer.send(servicebusTopicsChannels.GET_TOPICS, connection);
    return from(promise);
  }
}
