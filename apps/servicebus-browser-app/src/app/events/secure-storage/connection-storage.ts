import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { safeStorage } from 'electron';
import path from 'path';
import * as fs from 'fs';
import { ConnectionStore } from '@service-bus-browser/service-bus-server';
import { WorkspaceStorage } from './workspace-storage';

export class SecureConnectionStorage implements ConnectionStore {
  connectionsPath: string;

  constructor(
    userDataMainFolder: string,
    private readonly workspaceStorage?: WorkspaceStorage,
  ) {
    this.connectionsPath = path.join(
      userDataMainFolder,
      'sbb-connections.json',
    );
  }

  addConnection(connection: Connection): void {
    const activeWorkspaceId = this.workspaceStorage?.getActiveWorkspaceId();
    const connections = this.readCurrentConnections();
    connections[connection.id] = activeWorkspaceId
      ? { ...connection, workspaceId: activeWorkspaceId }
      : connection;
    this.writeConnections(connections);
  }

  removeConnection(connectionId: UUID): void {
    const connections = this.readCurrentConnections();
    delete connections[connectionId];
    this.writeConnections(connections);
  }

  listConnections(): Array<{ connectionId: UUID; connectionName: string }> {
    const connections = this.readCurrentConnections();
    const activeWorkspaceId = this.workspaceStorage?.getActiveWorkspaceId();
    return Object.entries(connections)
      .filter(([_, connection]) =>
        !activeWorkspaceId ||
        !connection.workspaceId ||
        connection.workspaceId === activeWorkspaceId,
      )
      .map(([connectionId, connection]) => ({
        connectionId: connectionId as UUID,
        connectionName: connection.name,
      }));
  }

  getConnection(connectionId: UUID): Connection | undefined {
    const connections = this.readCurrentConnections();
    return connections[connectionId];
  }

  readCurrentConnections(): { [key: UUID]: Connection } {
    if (fs.existsSync(this.connectionsPath)) {
      const fileContentBuffer = fs.readFileSync(this.connectionsPath);
      const fileContent = safeStorage.decryptString(fileContentBuffer);
      const connections = JSON.parse(fileContent);
      return [
        ...Object.values(connections)
          .map((c) => c as Connection)
          .map(
            (connection: Connection) =>
              ({
                ...connection,
                target: connection.target ?? 'serviceBus',
              }) as Connection,
          ),
      ].reduce(
        (acc, connection) => ({
          ...acc,
          [connection.id]: connection,
        }),
        {},
      );
    }

    return {};
  }

  writeConnections(connections: { [key: UUID]: Connection }) {
    const connectionsJson = JSON.stringify(connections);
    const encryptedConnections = safeStorage.encryptString(connectionsJson);
    fs.writeFileSync(this.connectionsPath, encryptedConnections, {
      encoding: 'utf8',
    });
  }
}
