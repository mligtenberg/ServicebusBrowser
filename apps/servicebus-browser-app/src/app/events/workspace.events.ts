import { BrowserWindow, ipcMain } from 'electron';
import { WorkspacesServer } from '@service-bus-browser/service-bus-server';
import App from '../app';
import { WorkspaceStorage } from './secure-storage/workspace-storage';
import {
  findWindowForWorkspace,
  setActivePageForWindow,
  setActiveWorkspaceForWindow,
} from './workspace-window-registry';

let server: WorkspacesServer | undefined;

export function getWorkspacesServer(): WorkspacesServer {
  if (!server) {
    throw new Error('Workspaces server not initialized');
  }
  return server;
}

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): void {
    server = new WorkspacesServer(
      new WorkspaceStorage(App.application.getPath('userData')),
    );
  }
}

ipcMain.handle(
  'workspaces:do-request',
  async (_event, requestType: string, request: unknown) => {
    if (!server) {
      throw new Error('Workspaces server not initialized');
    }
    return await server.workspacesExecute(requestType, request);
  },
);

// The renderer reports which workspace it's showing, on boot and on every
// switch, so the registry stays accurate without main having to poll.
ipcMain.on(
  'workspace-window:report-active',
  (event, workspaceId: string) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      setActiveWorkspaceForWindow(window.id, workspaceId);
    }
  },
);

// The renderer reports its active Message Page (or null) on every
// navigation, mirroring report-active above — this is what backs the
// get_active_page MCP tool without a live query round trip to the window.
ipcMain.on(
  'workspace-window:report-active-page',
  (event, page: { pageId: string; pageName: string } | null) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      setActivePageForWindow(window.id, page);
    }
  },
);

// Before opening a workspace, check whether it's already open in another
// window; if so, focus that window instead of opening it again.
ipcMain.handle(
  'workspace-window:focus-if-open',
  (event, workspaceId: string) => {
    const callerWindow = BrowserWindow.fromWebContents(event.sender);
    const target = findWindowForWorkspace(workspaceId, App.windows);

    if (!target) {
      return { found: false };
    }
    if (target === callerWindow) {
      return { found: true, sameWindow: true };
    }

    if (target.isMinimized()) {
      target.restore();
    }
    target.focus();
    return { found: true, sameWindow: false };
  },
);

ipcMain.handle(
  'workspace-window:open-in-new-window',
  (_event, workspaceId: string) => {
    App.openNewWindow(workspaceId);
  },
);
