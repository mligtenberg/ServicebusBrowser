import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { ConnectionType, IConnection, IConnectionStringConnectionDetails } from './ngrx/connections.models';
import { ServiceBusClient, ServiceBusAdministrationClient } from '@azure/service-bus';
import { LogService } from '../logging/log.service';

@Injectable({
  providedIn: 'root'
})
export class ServicebusConnectionService {

  constructor(private log: LogService) { }

  testConnection(connection: IConnection): Observable<boolean> {    
    try {
      this.log.logVerbose("Trying to establish connection");
      const client = this.initAdminClient(connection);
      
      // try a simple operation
      const result = client.listQueues()
      .next().then(c => {
        console.log(c);
        this.log.logInfo("Test successfull");
        return true;
      }) as Promise<boolean>;

      result.catch(e => {
        console.log(e);
      })

      return from(result);
    } catch (e) {
      if (e.message !== undefined) {
        const error = e as Error;
        this.log.logInfo("Test failed: " + error.message);
        return throwError(error.message);
      } else {
        this.log.logInfo("Test failed because of unknown reason");
        return throwError('test failed because of unknown reason');
      }
    }

  }

  private initClient(connection: IConnection): ServiceBusClient {
    switch(connection.connectionType) {
      case ConnectionType.connectionString:
        const connectionDetails = connection.connectionDetails as IConnectionStringConnectionDetails;
        return new ServiceBusClient(connectionDetails.connectionString);
      default:
        throw new Error("Connection type not supported yet, cannot create client");
    }
  }

  private initAdminClient(connection: IConnection): ServiceBusAdministrationClient {
    switch(connection.connectionType) {
      case ConnectionType.connectionString:
        const connectionDetails = connection.connectionDetails as IConnectionStringConnectionDetails;
        return new ServiceBusAdministrationClient(connectionDetails.connectionString);
      default:
        throw new Error("Connection type not supported yet, cannot create client");
    }
  }
}
