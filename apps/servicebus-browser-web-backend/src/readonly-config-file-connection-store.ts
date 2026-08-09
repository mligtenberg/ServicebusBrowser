import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from '@service-bus-browser/service-bus-server';
import { ParsedConfig } from './web-config-loader';

export class ReadonlyConfigFileConnectionStorage implements ConnectionStore {
  readonly isReadonly = true;

  constructor(private readonly config: ParsedConfig) {}

  addConnection(_connection: Connection): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  renameConnection(_connectionId: UUID, _name: string): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  removeConnection(_connectionId: UUID): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  listConnections(workspaceId: UUID): Array<{ connectionId: UUID; connectionName: string }> {
    return this.workspaceConnections(workspaceId).map((c) => ({
      connectionId: c.id,
      connectionName: c.name,
    }));
  }

  getConnection(connectionId: UUID): Connection | undefined {
    // Connection ids are unique across all workspaces (enforced at config load
    // time), so a lookup by id never needs to be scoped to a workspace.
    for (const ws of this.config.workspaces) {
      const connection = ws.connections.find((c) => c.id === connectionId);
      if (connection) {
        return connection;
      }
    }
    return undefined;
  }

  private workspaceConnections(workspaceId: UUID): Connection[] {
    const ws = this.config.workspaces.find((w) => w.id === workspaceId);
    return ws?.connections ?? [];
  }
}
