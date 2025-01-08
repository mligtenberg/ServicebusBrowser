import { ipcMain } from 'electron';
import { managementExecute, messagesExecute } from '@service-bus-browser/service-bus-server';

export default class ServiceBusEvents {
  static bootstrapServiceBusEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

ipcMain.handle('service-bus:management-do-request', async (event, requestType: string, request: unknown) => {
  return await managementExecute(requestType, request);
});

ipcMain.handle('service-bus:messages-do-request', async (event, requestType: string, request: unknown) => {
  return await messagesExecute(requestType, request);
});
