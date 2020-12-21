import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { LogService } from '../logging/log.service';
import { IConnection } from './ngrx/connections.models';
import { ipcRenderer } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class ServicebusConnectionService {
  constructor(private log: LogService) {}

  testConnection(connection: IConnection): Observable<boolean> {
    var promise = new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('servicebus:test.result', (event, ...args) => {
        const successfull = args[0];
        if (successfull) {
          this.log.logInfo('Connection established, test successfull');
          resolve(true);
        } else {
          const reason = args[1];
          reject(reason);
        }
      });
    });

    ipcRenderer.send('servicebus:test', connection);
    return from(promise);
  }
}
