import { ipcMain } from 'electron';
import App from '../app';
import { WorkspaceStorage } from './secure-storage/workspace-storage';

let workspaceStorage: WorkspaceStorage | undefined;

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): void {
    workspaceStorage = new WorkspaceStorage(App.application.getPath('userData'));
  }
}

ipcMain.handle('workspaces:get-active', () => {
  if (!workspaceStorage) {
    throw new Error('WorkspaceStorage not initialized');
  }
  return workspaceStorage.getActiveWorkspace();
});
