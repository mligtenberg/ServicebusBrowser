import { ipcMain } from 'electron';
import { Server } from '@service-bus-browser/service-bus-server';
import { SecureConnectionStorage } from './secure-storage/connection-storage';
import App from '../app';

let server: Server | undefined = undefined;
export default class ServiceBusEvents {
  static bootstrapServiceBusEvents(): Electron.IpcMain {
    server = new Server(new SecureConnectionStorage(App.application.getPath('userData')));
    return ipcMain;
  }
}

ipcMain.handle(
  'management:do-request',
  async (event, requestType: string, request: unknown) => {
    if (!server) {
      throw new Error('Server not initialized');
    }

    return await server.serviceBusManagementExecute(requestType, request);
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
