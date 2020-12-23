import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LogService } from '../logging/log.service';
import { IConnection } from './ngrx/connections.models';
import { ipcRenderer } from 'electron';
import { serviceBusChannels, secretsChannels } from '../../../../ipcModels/channels';
import { ISecret } from '../../../../ipcModels/ISecret';

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

  storeConnectionAsync(connection: IConnection): Promise<void> {
    var promise = new Promise<void>((resolve, reject) => {

      ipcRenderer.once(secretsChannels.ADD_SECRET_REPONSE, (event, ...args) => {
        const success = args[0] as boolean;


        if (success) {
          resolve();
        } else {
          const reason = args[1] as string;
          reject(reason);
        }
      });
    });

    ipcRenderer.send(secretsChannels.ADD_SECRET, connection.id, JSON.stringify(connection));
    return promise;
  }

  deleteConnectionAsync(connectionId: string): Promise<void> {
    var promise = new Promise<void>((resolve, reject) => {
      ipcRenderer.once(secretsChannels.DELETE_SECRET_RESPONSE, (event, ...args) => {
        const success = args[0] as boolean;
        
        if (success) {
          resolve();
        } else {
          const reason = args[1] as string;
          reject(reason);
        }
      });
    });

    ipcRenderer.send(secretsChannels.DELETE_SECRET, connectionId);
    return promise;
  }

  async getStoredConnectionsAsync(): Promise<IConnection[]> {
    var promise = new Promise<IConnection[]>((resolve, reject) => {
      ipcRenderer.once(secretsChannels.GET_SECRETS_RESPONSE, (event, ...args) => {
        const success = args[0] as boolean;
        
        if (success) {
          const secrets = args[1] as ISecret[];
          console.log(secrets);
          resolve(secrets.map(s => JSON.parse(s.value) as IConnection));
        } else {
          const reason = args[1] as string;
          reject(reason);
        }
      });
    });

    ipcRenderer.send(secretsChannels.GET_SECRETS);
    return promise;
  }

  async getConnectionAsync(id: string): Promise<IConnection> {
    return JSON.parse(localStorage.getItem(id)) as IConnection
  }
}
