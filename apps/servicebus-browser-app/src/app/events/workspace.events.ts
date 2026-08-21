import { BrowserWindow, ipcMain } from 'electron';
import { WorkspacesServer } from '@service-bus-browser/service-bus-server';
import { MessageFilter } from '@service-bus-browser/filtering';
import App from '../app';
import { WorkspaceStorage } from './secure-storage/workspace-storage';
import {
  findWindowForWorkspace,
  setActivePageFilterForWindow,
  setActivePageForWindow,
  setActiveWorkspaceForWindow,
  setSelectedMessageKeyForWindow,
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

// The renderer reports the message key selected in its Message Page grid
// (or null) on every selection change, mirroring report-active-page above —
// this is what backs the get_selected_message MCP tool.
ipcMain.on(
  'workspace-window:report-selected-message',
  (event, messageKey: string | null) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      setSelectedMessageKeyForWindow(window.id, messageKey);
    }
  },
);

// The renderer reports the filter currently applied to its active Message
// Page (or null) whenever it changes, mirroring report-active-page above —
// this is what backs get_page_messages' "no filter given, use the page's
// current filter" default, since main has no other way to observe that
// renderer's NgRx filter state.
ipcMain.on(
  'workspace-window:report-active-page-filter',
  (event, filter: MessageFilter | null) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      setActivePageFilterForWindow(window.id, filter);
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
