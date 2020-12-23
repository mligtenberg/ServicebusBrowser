import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LogService } from '../logging/log.service';
import { IConnection } from './ngrx/connections.models';
import { ipcRenderer } from 'electron';
import { serviceBusChannels } from '../../../../ipcModels/channels';
import * as keytar from 'keytar';
import { SERVICE_NAME } from '../constants';
@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  constructor(private log: LogService) {}

  testConnection(connection: IConnection): Observable<boolean> {
    var promise = new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once(serviceBusChannels.TEST_RESPONSE, (event, ...args) => {
        const successfull = args[0];
        if (successfull) {
          this.log.logInfo('Connection established, test successfull');
          resolve(true);
        } else {
          const reason = args[1];
          this.log.logWarning(`Connection failed: ${reason}`)
          reject(reason);
        }
      });
    });

    ipcRenderer.send(serviceBusChannels.TEST, connection);
    return from(promise);
  }

  async storeConnectionAsync(connection: IConnection): Promise<void> {
    // TODO store connection secure via keytar
    localStorage.setItem(connection.id, JSON.stringify(connection));
  }

  async getConnectionOptionsAsync(): Promise<IConnection[]> {
    return Object.entries(localStorage).map(e => JSON.parse(e[1]) as IConnection);
  }

  async getConnectionAsync(id: string): Promise<IConnection> {
    return JSON.parse(localStorage.getItem(id)) as IConnection
  }
}
