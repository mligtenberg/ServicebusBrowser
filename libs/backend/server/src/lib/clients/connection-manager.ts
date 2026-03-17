import {
  Connection,
} from '@service-bus-browser/api-contracts';
import { ConnectionClient } from './connection-client';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from './connection-store';

export class ConnectionManager {
  constructor(private connectionStore: ConnectionStore) {}

  addConnection(connection: Connection) {
    this.connectionStore.addConnection(connection);
  }

  removeConnection(connectionId: UUID) {
    this.connectionStore.removeConnection(connectionId);
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

    return new ConnectionClient(connection);
  }

  listConnections(): { connectionId: UUID; connectionName: string }[] {
    return this.connectionStore.listConnections();
  }
}
