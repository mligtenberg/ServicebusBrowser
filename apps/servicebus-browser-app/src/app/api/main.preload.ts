import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

contextBridge.exposeInMainWorld('serviceBusApi', {
  doRequest: (requestType: string, request) => ipcRenderer.invoke('service-bus:do-request', requestType, request),
})
