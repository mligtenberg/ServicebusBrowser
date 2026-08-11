import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  onFullScreenChanged: (callback: (fullscreen: boolean) => void) =>
    ipcRenderer.on('fullscreen-changed', (_, full) => callback(full)),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  reportActiveWorkspace: (workspaceId: string) =>
    ipcRenderer.send('workspace-window:report-active', workspaceId),
  focusWorkspaceWindowIfOpen: (
    workspaceId: string,
  ): Promise<{ found: boolean; sameWindow?: boolean }> =>
    ipcRenderer.invoke('workspace-window:focus-if-open', workspaceId),
  openWorkspaceInNewWindow: (workspaceId: string): Promise<void> =>
    ipcRenderer.invoke('workspace-window:open-in-new-window', workspaceId),
  onNavigateToTopologyPath: (callback: (path: string) => void) =>
    ipcRenderer.on('mcp:navigate-to-topology-path', (_, path) => callback(path)),
  onOpenMessagePage: (
    callback: (request: { workspaceId: string; pageId: string }) => void,
  ) => ipcRenderer.on('mcp:open-message-page', (_, request) => callback(request)),
  reportActivePage: (page: { pageId: string; pageName: string } | null) =>
    ipcRenderer.send('workspace-window:report-active-page', page),
  reportSelectedMessage: (messageKey: string | null) =>
    ipcRenderer.send('workspace-window:report-selected-message', messageKey),
});

contextBridge.exposeInMainWorld('mcpApi', {
  getStatus: () => ipcRenderer.invoke('mcp:get-status'),
  setEnabled: (enabled: boolean) => ipcRenderer.invoke('mcp:set-enabled', enabled),
  setPort: (port: number) => ipcRenderer.invoke('mcp:set-port', port),
  regenerateToken: () => ipcRenderer.invoke('mcp:regenerate-token'),
});

// Used only by the hidden per-Workspace renderer (ADR-0011) to answer MCP
// query-tool RPCs (ADR-0012) sent from the main process. Harmless on the
// visible app's window, which never calls it.
contextBridge.exposeInMainWorld('headlessApi', {
  onListPages: (callback: (request: { requestId: string }) => void) =>
    ipcRenderer.on('headless:list-pages', (_, request) => callback(request)),
  onDescribePage: (
    callback: (request: { requestId: string; pageId: string }) => void,
  ) => ipcRenderer.on('headless:describe-page', (_, request) => callback(request)),
  onRunQuery: (
    callback: (request: { requestId: string; pageId: string; sql: string }) => void,
  ) => ipcRenderer.on('headless:run-query', (_, request) => callback(request)),
  onGetMessage: (
    callback: (request: { requestId: string; pageId: string; messageKey: string }) => void,
  ) => ipcRenderer.on('headless:get-message', (_, request) => callback(request)),
  respond: (requestId: string, result: { data?: unknown; error?: string }) =>
    ipcRenderer.send(`headless:response:${requestId}`, result),
  notifyReady: () => ipcRenderer.send('headless:ready'),
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
