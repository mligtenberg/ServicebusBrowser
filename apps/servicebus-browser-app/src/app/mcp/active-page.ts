import App from '../app';
import { getActivePageForWindow, getWorkspaceForWindow } from '../events/workspace-window-registry';

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
