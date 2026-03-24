import {
  Connection,
} from '@service-bus-browser/api-contracts';
import { ConnectionClient } from './connection-client';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from './connection-store';

export class ConnectionManager {
  connectionClients = new Map<UUID, ConnectionClient>();

  constructor(private connectionStore: ConnectionStore) {}

  addConnection(connection: Connection) {
    this.connectionStore.addConnection(connection);
  }

  removeConnection(connectionId: UUID) {
    this.connectionStore.removeConnection(connectionId);
    this.connectionClients.delete(connectionId);
  }

  getConnection(options: { id: UUID }) {
    return this.connectionStore.getConnection(options.id);
  }

  getConnectionClient(
    options: { id: UUID } | { connection: Connection },
  ): ConnectionClient {
    const connection =
      'connection' in options
        ? options.connection
        : this.getConnection(options);

    if (connection === undefined) {
      const optionsId = 'id' in options ? options.id : undefined;
      throw new Error(`Connection ${optionsId as string} not found`);
    }

    if (this.connectionClients.has(connection.id)) {
      return this.connectionClients.get(connection.id)!;
    }

    const client = new ConnectionClient(connection);
    this.connectionClients.set(connection.id, client);
    return client;
  }

  listConnections(): { connectionId: UUID; connectionName: string }[] {
    return this.connectionStore.listConnections();
  }
}
