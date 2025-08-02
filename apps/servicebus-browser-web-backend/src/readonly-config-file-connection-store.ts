import { ConnectionStore } from '@service-bus-browser/service-bus-clients';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import * as fs from 'fs';

export class ReadonlyConfigFileConnectionStorage implements ConnectionStore {
  connectionsPath: string;

  constructor() {
    this.connectionsPath = `${process.cwd()}/sbb-connections.json`;
  }

  addConnection(connection: Connection): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  removeConnection(connectionId: UUID): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  listConnections(): Array<{ connectionId: UUID; connectionName: string }> {
    const connections = this.readCurrentConnections();
    return Object.entries(connections).map(([connectionId, connection]) => ({
      connectionId: connectionId as UUID,
      connectionName: connection.name,
    }));
  }

  getConnection(connectionId: UUID): Connection | undefined {
    const connections = this.readCurrentConnections();
    return connections[connectionId];
  }

  private readCurrentConnections(): Record<UUID, Connection> {
    if (fs.existsSync(this.connectionsPath)) {
      const fileContent = fs.readFileSync(this.connectionsPath, 'utf8');
      const connections: Connection[] = JSON.parse(fileContent);

      return connections.reduce<Record<UUID, Connection>>((acc, connection) => {
        acc[connection.id] = connection;
        return acc;
      }, {});
    }

    return {};
  }
}
