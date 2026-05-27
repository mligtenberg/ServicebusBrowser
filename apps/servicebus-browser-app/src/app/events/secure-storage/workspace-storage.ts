import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { safeStorage } from 'electron';
import path from 'path';
import * as fs from 'fs';

interface WorkspacesFile {
  version: 1;
  workspaces: Workspace[];
  activeWorkspaceId?: UUID;
}

export class WorkspaceStorage {
  private readonly workspacesPath: string;
  private readonly connectionsPath: string;

  constructor(userDataMainFolder: string) {
    this.workspacesPath = path.join(userDataMainFolder, 'sbb-workspaces.json');
    this.connectionsPath = path.join(userDataMainFolder, 'sbb-connections.json');
  }

  exists(): boolean {
    return fs.existsSync(this.workspacesPath);
  }

  read(): WorkspacesFile | null {
    if (!this.exists()) return null;
    const buffer = fs.readFileSync(this.workspacesPath);
    const json = safeStorage.decryptString(buffer);
    return JSON.parse(json);
  }

  write(data: WorkspacesFile): void {
    const json = JSON.stringify(data);
    const encrypted = safeStorage.encryptString(json);
    fs.writeFileSync(this.workspacesPath, encrypted, { encoding: 'utf8' });
  }

  listWorkspaces(): Workspace[] {
    return this.read()?.workspaces ?? [];
  }

  createWorkspace(workspace: Workspace): void {
    const current = this.read() ?? { version: 1, workspaces: [] };
    this.write({ ...current, workspaces: [...current.workspaces, workspace] });
  }

  setActiveWorkspaceId(id: UUID): void {
    const current = this.read() ?? { version: 1, workspaces: [] };
    this.write({ ...current, activeWorkspaceId: id });
  }

  getActiveWorkspaceId(): UUID | undefined {
    return this.read()?.activeWorkspaceId;
  }

  renameWorkspace(id: UUID, name: string): void {
    const current = this.read() ?? { version: 1, workspaces: [] };
    const workspaces = current.workspaces.map((w) =>
      w.id === id ? { ...w, name } : w,
    );
    this.write({ ...current, workspaces });
  }

  deleteWorkspace(id: UUID): void {
    const current = this.read() ?? { version: 1, workspaces: [] };
    const workspaces = current.workspaces.filter((w) => w.id !== id);
    const activeWorkspaceId =
      current.activeWorkspaceId === id ? workspaces[0]?.id : current.activeWorkspaceId;
    this.write({ ...current, workspaces, activeWorkspaceId });
  }

  countConnectionsByWorkspace(id: UUID): number {
    const connections = this.readConnections();
    return Object.values(connections).filter(
      (c) => (c as any).workspaceId === id,
    ).length;
  }

  deleteConnectionsByWorkspace(id: UUID): void {
    const connections = this.readConnections();
    const filtered = Object.fromEntries(
      Object.entries(connections).filter(([, c]) => (c as any).workspaceId !== id),
    );
    this.writeConnections(filtered);
  }

  private readConnections(): Record<string, unknown> {
    if (!fs.existsSync(this.connectionsPath)) return {};
    const buffer = fs.readFileSync(this.connectionsPath);
    const json = safeStorage.decryptString(buffer);
    return JSON.parse(json);
  }

  private writeConnections(connections: Record<string, unknown>): void {
    if (!fs.existsSync(this.connectionsPath)) return;
    const json = JSON.stringify(connections);
    const encrypted = safeStorage.encryptString(json);
    fs.writeFileSync(this.connectionsPath, encrypted, { encoding: 'utf8' });
  }
}
