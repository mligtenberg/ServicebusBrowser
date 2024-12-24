import { ipcMain } from 'electron';
import { execute } from '@service-bus-browser/service-bus-server';

export default class ServiceBusEvents {
  static bootstrapServiceBusEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

ipcMain.handle('service-bus:do-request', async (event, requestType: string, request: unknown) => {
  return await execute(requestType, request);
});
