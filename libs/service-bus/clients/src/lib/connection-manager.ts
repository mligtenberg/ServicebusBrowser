import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ConnectionClient } from './connection-client';
import { UUID } from '@service-bus-browser/shared-contracts';

export class ConnectionManager {
  private connections: Map<UUID, Connection> = new Map();

  addConnection(connection: Connection) {
    this.connections.set(connection.id, connection);
  }

  removeConnection(connectionId: UUID) {
    if (!this.connections.delete(connectionId)) {
      throw new Error(`Connection ${ connectionId } not found`);
    }
  }

  getConnectionClient(options: { id: UUID } | {connection: Connection}): ConnectionClient {
    const connection = 'connection' in options
      ? options.connection
      : this.getConnection(options.id);

    if (connection === undefined) {
      // @ts-expect-error - when id is provided, connection is undefined
      throw new Error(`Connection ${ options['id'] as string } not found`);
    }

    return new ConnectionClient(connection);
  }

  listConnections(): {connectionId: UUID, connectionName: string}[] {
    const connectionsIterator = this.connections.values();
    const connections = Array.from(connectionsIterator);

    return connections.map(connection => ({
      connectionId: connection.id,
      connectionName: connection.name
    }));
  }

  private getConnection(id: UUID): Connection | undefined {
    return this.connections.get(id);
  }
}
