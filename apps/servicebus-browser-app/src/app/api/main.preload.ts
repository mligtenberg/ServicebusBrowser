import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  onFullScreenChanged: (callback: (fullscreen: boolean) => void) =>
    ipcRenderer.on('fullscreen-changed', (_, full) => callback(full)),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
});

contextBridge.exposeInMainWorld('backendApi', {
  managementDoRequest: (requestType: string, request: unknown) =>
    ipcRenderer.invoke('management:do-request', requestType, request),
  serviceBusManagementDoRequest: (requestType: string, request: unknown) =>
    ipcRenderer.invoke(
      'service-bus-management:do-request',
      requestType,
      request,
    ),
  messagesDoRequest: (requestType: string, request: unknown) =>
    ipcRenderer.invoke('messages:do-request', requestType, request),
  workspacesDoRequest: (requestType: string, request: unknown) =>
    ipcRenderer.invoke('workspaces:do-request', requestType, request),
});
