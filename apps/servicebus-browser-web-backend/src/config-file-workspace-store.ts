import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceStore } from '@service-bus-browser/service-bus-server';
import { ParsedConfig } from './web-config-loader';

/**
 * Same hash -> hue -> hex derivation the frontends use as their client-side
 * fallback avatar color, so a workspace without a configured `primaryColor`
 * gets the identical color whether or not the client happens to apply its
 * own fallback.
 */
function hashHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

function defaultPrimaryColor(id: string): string {
  return hslToHex(hashHue(id), 55, 45);
}

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
      primaryColor: ws.primaryColor ?? defaultPrimaryColor(ws.id),
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

  updateWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to update workspaces.');
  }

  deleteWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to delete workspaces.');
  }

  deleteConnectionsByWorkspace(): void {
    throw new Error('Web backend is read-only: edit the config file to delete connections.');
  }
}
