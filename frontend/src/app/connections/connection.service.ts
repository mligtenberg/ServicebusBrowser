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

  async getStoredConnectionsAsync(): Promise<IConnection[]> {
    try {
      const secrets = await window.secrets.getSecrets();
      return secrets.map(s => JSON.parse(s.value) as IConnection);
    } catch (reason) {
      throw reason;
    }
  }
}
