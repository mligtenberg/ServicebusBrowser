import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ConnectionClient } from './connection-client';

export class ConnectionManager {
  private connections: { [name: string]: Connection } = {};

  addConnection(connection: Connection) {
    this.connections[connection.name] = connection;
    console.log(`Connection ${connection.name} added`);
  }

  getConnectionClient(options: {name: string } | {connection: Connection}): ConnectionClient {
    const connection = 'connection' in options
      ? options.connection
      : this.getConnection(options.name);

    if (!connection) {
      throw new Error(`Connection ${name} not found`);
    }

    return new ConnectionClient(connection);
  }

  listConnections(): string[] {
    return Object.keys(this.connections);
  }

  private getConnection(name: string): Connection {
    return this.connections[name];
  }
}
