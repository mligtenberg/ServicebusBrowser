import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

contextBridge.exposeInMainWorld('serviceBusApi', {
  managementDoRequest: (requestType: string, request) => ipcRenderer.invoke('service-bus:management-do-request', requestType, request),
  messagesDoRequest: (requestType: string, request) => ipcRenderer.invoke('service-bus:messages-do-request', requestType, request),
})
