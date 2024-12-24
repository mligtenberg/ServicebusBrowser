import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ConnectionClient } from './connection-client';

export class ConnectionManager {
  private connections: { [name: string]: Connection } = {};

  addConnection(connection: Connection) {
    this.connections[connection.name] = connection;
  }

  getConnection(name: string): ConnectionClient {
    const connection = this.connections[name];

    if (!connection) {
      throw new Error(`Connection ${name} not found`);
    }

    return new ConnectionClient(connection);
  }

  listConnections(): string[] {
    return Object.keys(this.connections);
  }
}
