import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from './connection-store';

export class InmemoryConnectionStore implements ConnectionStore {
  private connections: Map<UUID, Connection> = new Map();

  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
  }
  removeConnection(connectionId: UUID): void {
    if (!this.connections.delete(connectionId)) {
      throw new Error(`Connection ${connectionId} not found`);
    }
  }

  listConnections(): Array<{ connectionId: UUID; connectionName: string }> {
    const connectionsIterator = this.connections.values();
    const connections = Array.from(connectionsIterator);

    return connections.map((connection) => ({
      connectionId: connection.id,
      connectionName: connection.name,
    }));
  }

  getConnection(connectionId: UUID): Connection | undefined {
    return this.connections.get(connectionId);
  }
}
