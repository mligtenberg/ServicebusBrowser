/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain } from 'electron';
import UpdateEvents from './update.events';
import { environment } from '../../environments/environment';

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
  console.log(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

// Manual update check
ipcMain.handle('check-for-updates', () => {
  UpdateEvents.checkForUpdates(true);
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
