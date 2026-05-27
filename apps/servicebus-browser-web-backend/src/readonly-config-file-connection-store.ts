import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionStore } from '@service-bus-browser/service-bus-server';
import { ParsedConfig } from './web-config-loader';

export class ReadonlyConfigFileConnectionStorage implements ConnectionStore {
  constructor(
    private readonly config: ParsedConfig,
    private readonly activeWorkspaceHolder: { id: UUID },
  ) {}

  addConnection(_connection: Connection): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  removeConnection(_connectionId: UUID): void {
    throw new Error('Method not implemented. This class is read-only.');
  }

  listConnections(): Array<{ connectionId: UUID; connectionName: string }> {
    return this.activeWorkspaceConnections().map((c) => ({
      connectionId: c.id,
      connectionName: c.name,
    }));
  }

  getConnection(connectionId: UUID): Connection | undefined {
    return this.activeWorkspaceConnections().find((c) => c.id === connectionId);
  }

  private activeWorkspaceConnections(): Connection[] {
    const ws = this.config.workspaces.find(
      (w) => w.id === this.activeWorkspaceHolder.id,
    );
    return ws?.connections ?? [];
  }
}
