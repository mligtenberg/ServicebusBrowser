import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  onFullScreenChanged: (callback: (fullscreen: boolean) => void) =>
    ipcRenderer.on('fullscreen-changed', (_, full) => callback(full)),
  onUpdateAvailable: (callback: (version: string) => void) =>
    ipcRenderer.on('update-available', (_, version) => callback(version)),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
});

contextBridge.exposeInMainWorld('serviceBusApi', {
  managementDoRequest: (requestType: string, request) =>
    ipcRenderer.invoke(
      'service-bus:management-do-request',
      requestType,
      request
    ),
  messagesDoRequest: (requestType: string, request) =>
    ipcRenderer.invoke('service-bus:messages-do-request', requestType, request),
});
