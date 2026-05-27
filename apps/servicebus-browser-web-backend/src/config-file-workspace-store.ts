import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceStore } from '@service-bus-browser/service-bus-server';
import { ParsedConfig } from './web-config-loader';

/**
 * Read-only WorkspaceStore backed by a static parsed config file.
 * Mutations (create/rename/delete) are not supported on the web backend —
 * the operator edits the config file directly.
 *
 * setActiveWorkspaceId is the one mutable operation: it updates an in-memory
 * holder so the connection store can filter connections accordingly.
 */
export class ConfigFileWorkspaceStore implements WorkspaceStore {
  private readonly workspaces: Workspace[];

  constructor(
    private readonly config: ParsedConfig,
    private readonly activeWorkspaceHolder: { id: UUID },
  ) {
    this.workspaces = config.workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      createdAt: new Date(0).toISOString(),
    }));
  }

  listWorkspaces(): Workspace[] {
    return this.workspaces;
  }

  setActiveWorkspaceId(id: UUID): void {
    const exists = this.workspaces.some((ws) => ws.id === id);
    if (!exists) {
      throw new Error(`Workspace with id "${id}" not found.`);
    }
    this.activeWorkspaceHolder.id = id;
  }

  countConnectionsByWorkspace(id: UUID): number {
    const ws = this.config.workspaces.find((w) => w.id === id);
    return ws?.connections.length ?? 0;
  }

  createWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to add workspaces.');
  }

  renameWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to rename workspaces.');
  }

  deleteWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to delete workspaces.');
  }

  deleteConnectionsByWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to delete connections.');
  }
}
