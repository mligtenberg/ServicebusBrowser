import { ipcMain } from 'electron';
import { Server } from '@service-bus-browser/service-bus-server';
import { SecureConnectionStorage } from './secure-storage/connection-storage';
import { WorkspaceStorage } from './secure-storage/workspace-storage';
import { registerIntegratedAuth } from './integrated-auth';
import App from '../app';

let server: Server | undefined = undefined;

export function getServer(): Server {
  if (!server) {
    throw new Error('Server not initialized');
  }
  return server;
}

export default class ServiceBusEvents {
  static bootstrapServiceBusEvents(): Electron.IpcMain {
    const userDataPath = App.application.getPath('userData');
    const workspaceStorage = new WorkspaceStorage(userDataPath);
    server = new Server(new SecureConnectionStorage(userDataPath, workspaceStorage));
    registerIntegratedAuth(userDataPath);
    return ipcMain;
  }
}

ipcMain.handle(
  'management:do-request',
  async (event, requestType: string, request: unknown) => {
    if (!server) {
      throw new Error('Server not initialized');
    }

    return await server.managementExecute(requestType, request);
  },
);

ipcMain.handle('service-bus-management:do-request', async (event, requestType: string, request: unknown) => {
  if (!server) {
    throw new Error('Server not initialized');
  }

  return await server.serviceBusManagementExecute(requestType, request);
});

ipcMain.handle('messages:do-request', async (event, requestType: string, request: unknown) => {
  if (!server) {
    throw new Error('Server not initialized');
  }

  return await server.messagesExecute(requestType, request);
});
