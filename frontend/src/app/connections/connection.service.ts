import { Injectable } from '@angular/core';
import { LogService } from '../logging/log.service';
import { IConnection } from './ngrx/connections.models';
import { ServiceBusClient, ServiceBusAdministrationClient } from '@azure/service-bus';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  constructor() {}

  getClient(connection: IConnection): ServiceBusClient {
    return window.servicebusConnections.getClient(connection);
  }
  
  getAdminClient(
    connection: IConnection
  ): ServiceBusAdministrationClient {
    return window.servicebusConnections.getAdminClient(connection);
  }

  async testConnection(connection: IConnection): Promise<boolean> {
    const client = this.getAdminClient(connection);
  
    // try a simple operation
    await client.listQueues().next();
  
    return true;
  }

  async storeConnectionAsync(connection: IConnection): Promise<void> {
    await window.secrets.saveSecret({
      key: connection.id,
      value: JSON.stringify(connection)
    })
  }

  async deleteConnectionAsync(connectionId: string): Promise<void> {
    await window.secrets.deleteSecret(connectionId);
  }

  getStoredConnectionsAsync(attemped: number = 0): Promise<IConnection[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const secrets = await window.secrets.getSecrets();
        resolve(secrets.map(s => JSON.parse(s.value) as IConnection));
        return;
      } catch (reason) {
        if (attemped === 3) {
          reject(reason);
        }
        setTimeout(async () => {
          resolve(await this.getStoredConnectionsAsync(attemped++));
        })
      }
    });
  }
}
