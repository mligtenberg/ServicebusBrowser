import { ConnectionStore } from '@service-bus-browser/service-bus-clients';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { safeStorage } from 'electron';
import path from 'path';
import * as fs from 'fs';

export class SecureConnectionStorage implements ConnectionStore {
  connectionsPath: string;

  constructor(userDataMainFolder: string) {
    this.connectionsPath = path.join(userDataMainFolder, 'sbb-connections.json');
  }

  addConnection(connection: Connection): void {
    const connections = this.readCurrentConnections();
    connections[connection.id] = connection;
    this.writeSettings(connections);
  }

  removeConnection(connectionId: UUID): void {
    const connections = this.readCurrentConnections();
    delete connections[connectionId];
    this.writeSettings(connections);
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

  private readCurrentConnections(): { [key: UUID]: Connection } {
    if (fs.existsSync(this.connectionsPath)) {
      const fileContentBuffer = fs.readFileSync(this.connectionsPath);
      const fileContent = safeStorage.decryptString(fileContentBuffer);
      return JSON.parse(fileContent);
    }

    return {};
  }

  private writeSettings(connections: { [key: UUID]: Connection }) {
    const connectionsJson = JSON.stringify(connections);
    const encryptedConnections = safeStorage.encryptString(connectionsJson);
    fs.writeFileSync(this.connectionsPath, encryptedConnections, {
      encoding: 'utf8',
    });
  }
}
