import App from '../app';
import {
  getActivePageForWindow,
  getSelectedMessageKeyForWindow,
  getWorkspaceForWindow,
} from '../events/workspace-window-registry';

export interface ActivePage {
  workspaceId: string;
  pageId: string;
  pageName: string;
}

/**
 * The Message Page currently shown by the last-opened app window, along
 * with its Workspace id — a synchronous read of state the renderer already
 * pushes to main on every navigation (`workspace-window:report-active-page`,
 * mirroring the existing `report-active` workspace push), rather than a
 * live query round trip: the MCP server runs in the main process, which has
 * no other way to observe a window's current Angular Router state. Returns
 * null if no window is open, or the open window isn't currently viewing a
 * Message Page.
 */
export function getActivePage(): ActivePage | null {
  const candidates = App.windows.filter((window) => !window.isDestroyed());
  const window = candidates[candidates.length - 1];
  if (!window) {
    return null;
  }

  const workspaceId = getWorkspaceForWindow(window.id);
  const page = getActivePageForWindow(window.id);
  if (!workspaceId || !page) {
    return null;
  }

  return { workspaceId, pageId: page.pageId, pageName: page.pageName };
}

export interface SelectedMessageRef {
  workspaceId: string;
  pageId: string;
  pageName: string;
  messageKey: string;
}

/**
 * The message currently selected in the active Message Page (see
 * `getActivePage`) of the last-opened app window, if any — reported by the
 * renderer on every selection change (`workspace-window:report-selected-message`),
 * the same push pattern `getActivePage` relies on. Returns null if no window
 * is open, the open window isn't viewing a Message Page, or nothing is
 * currently selected in its grid.
 */
export function getSelectedMessageRef(): SelectedMessageRef | null {
  const candidates = App.windows.filter((window) => !window.isDestroyed());
  const window = candidates[candidates.length - 1];
  if (!window) {
    return null;
  }

  const workspaceId = getWorkspaceForWindow(window.id);
  const page = getActivePageForWindow(window.id);
  const messageKey = getSelectedMessageKeyForWindow(window.id);
  if (!workspaceId || !page || !messageKey) {
    return null;
  }

  return { workspaceId, pageId: page.pageId, pageName: page.pageName, messageKey };
}
