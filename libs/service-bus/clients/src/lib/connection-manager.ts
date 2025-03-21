import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ConnectionClient } from './connection-client';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from './connection-store';

export class ConnectionManager {
  constructor(private connectionStore: ConnectionStore) {
  }

  addConnection(connection: Connection) {
    this.connectionStore.addConnection(connection);
  }

  removeConnection(connectionId: UUID) {
    this.connectionStore.removeConnection(connectionId);
  }

  getConnectionClient(options: { id: UUID } | {connection: Connection}): ConnectionClient {
    const connection = 'connection' in options
      ? options.connection
      : this.connectionStore.getConnection(options.id);

    if (connection === undefined) {
      const optionsId = 'id' in options ? options.id : undefined;
      throw new Error(`Connection ${ optionsId as string } not found`);
    }

    return new ConnectionClient(connection);
  }

  listConnections(): {connectionId: UUID, connectionName: string}[] {
    return this.connectionStore.listConnections();
  }
}
