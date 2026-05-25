import { Workspace } from '@service-bus-browser/shared-contracts';
import { safeStorage } from 'electron';
import path from 'path';
import * as fs from 'fs';

interface WorkspacesFile {
  version: 1;
  workspaces: Workspace[];
}

export class WorkspaceStorage {
  private readonly workspacesPath: string;

  constructor(userDataMainFolder: string) {
    this.workspacesPath = path.join(userDataMainFolder, 'sbb-workspaces.json');
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
}
