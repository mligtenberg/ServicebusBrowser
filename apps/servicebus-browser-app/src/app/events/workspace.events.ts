import { ipcMain } from 'electron';
import { WorkspacesServer } from '@service-bus-browser/service-bus-server';
import App from '../app';
import { WorkspaceStorage } from './secure-storage/workspace-storage';

let server: WorkspacesServer | undefined;

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): void {
    server = new WorkspacesServer(
      new WorkspaceStorage(App.application.getPath('userData')),
    );
  }
}

ipcMain.handle(
  'workspaces:do-request',
  async (_event, requestType: string, request: unknown) => {
    if (!server) {
      throw new Error('Workspaces server not initialized');
    }
    return await server.workspacesExecute(requestType, request);
  },
);
