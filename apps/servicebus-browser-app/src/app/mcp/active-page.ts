import { MessageFilter } from '@service-bus-browser/filtering';
import App from '../app';
import {
  getActivePageFilterForWindow,
  getActivePageForWindow,
  getActiveWindow,
  getSelectedMessageKeyForWindow,
  getWorkspaceForWindow,
} from '../events/workspace-window-registry';

export interface ActivePage {
  workspaceId: string;
  pageId: string;
  pageName: string;
}

/**
 * The active app window — the last-focused one, or the most recently opened
 * one if none has been focused yet (see `getActiveWindow`). Shared by every
 * MCP tool that acts on "the" window rather than an explicit `workspaceId`.
 */
function activeWindow() {
  return getActiveWindow(App.windows);
}

/**
 * The Workspace id currently shown by the active app window (see
 * `activeWindow`). Returns null if no window is open. Backs the
 * `get_active_workspace` MCP tool — the entry point for discovering which
 * `workspaceId` to pass to `list_message_pages` etc. when the caller doesn't
 * already know it.
 */
export function getActiveWorkspaceId(): string | null {
  const window = activeWindow();
  if (!window) {
    return null;
  }
  return getWorkspaceForWindow(window.id) ?? null;
}

/**
 * The Message Page currently shown by the active app window, along with its
 * Workspace id — a synchronous read of state the renderer already pushes to
 * main on every navigation (`workspace-window:report-active-page`,
 * mirroring the existing `report-active` workspace push), rather than a
 * live query round trip: the MCP server runs in the main process, which has
 * no other way to observe a window's current Angular Router state. Returns
 * null if no window is open, or the active window isn't currently viewing a
 * Message Page.
 */
export function getActivePage(): ActivePage | null {
  const window = activeWindow();
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

/**
 * The filter currently applied to a given Message Page, if that page
 * happens to be the one the active app window's route is currently
 * showing — the only case main can know it (see
 * `activePageFilterByWindowId` in `workspace-window-registry.ts`), since the
 * filter itself lives only in that renderer's NgRx store. Returns null both
 * when the page isn't the active one (unknown, not "no filter") and when it
 * is but genuinely has no filter applied — callers that need to
 * distinguish those should check `getActivePage()` first. Backs
 * `get_page_messages`' "no filter given" default.
 */
export function getActivePageFilterFor(
  workspaceId: string,
  pageId: string,
): MessageFilter | null {
  const window = activeWindow();
  if (!window) {
    return null;
  }

  const activeWorkspaceId = getWorkspaceForWindow(window.id);
  const activePage = getActivePageForWindow(window.id);
  if (activeWorkspaceId !== workspaceId || activePage?.pageId !== pageId) {
    return null;
  }

  return getActivePageFilterForWindow(window.id);
}

export interface SelectedMessageRef {
  workspaceId: string;
  pageId: string;
  pageName: string;
  messageKey: string;
}

/**
 * The message currently selected in the active Message Page (see
 * `getActivePage`) of the active app window, if any — reported by the
 * renderer on every selection change (`workspace-window:report-selected-message`),
 * the same push pattern `getActivePage` relies on. Returns null if no window
 * is open, the active window isn't viewing a Message Page, or nothing is
 * currently selected in its grid.
 */
export function getSelectedMessageRef(): SelectedMessageRef | null {
  const window = activeWindow();
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
