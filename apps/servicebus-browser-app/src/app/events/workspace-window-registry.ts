import { BrowserWindow } from 'electron';

/**
 * Tracks which workspace each open app window is currently showing, reported
 * by the renderer (on boot and on every switch). Used to detect "this
 * workspace is already open somewhere" before opening it again.
 */
const workspaceByWindowId = new Map<number, string>();

/**
 * Tracks which Message Page each open app window's route is currently
 * showing, if any — reported by the renderer on every navigation (same push
 * pattern as `workspaceByWindowId`, since main has no other way to observe a
 * window's live Angular Router state). Backs the `get_active_page` MCP tool.
 */
const activePageByWindowId = new Map<number, { pageId: string; pageName: string } | null>();

/**
 * Tracks the message key currently selected in each open app window's
 * Message Page grid, if any — reported by the renderer on every selection
 * change (same push pattern as `activePageByWindowId`). Backs the
 * `get_selected_message` MCP tool.
 */
const selectedMessageKeyByWindowId = new Map<number, string | null>();

export function setActiveWorkspaceForWindow(
  windowId: number,
  workspaceId: string,
): void {
  workspaceByWindowId.set(windowId, workspaceId);
}

export function getWorkspaceForWindow(windowId: number): string | undefined {
  return workspaceByWindowId.get(windowId);
}

export function setActivePageForWindow(
  windowId: number,
  page: { pageId: string; pageName: string } | null,
): void {
  activePageByWindowId.set(windowId, page);
}

export function getActivePageForWindow(
  windowId: number,
): { pageId: string; pageName: string } | null {
  return activePageByWindowId.get(windowId) ?? null;
}

export function setSelectedMessageKeyForWindow(
  windowId: number,
  messageKey: string | null,
): void {
  selectedMessageKeyByWindowId.set(windowId, messageKey);
}

export function getSelectedMessageKeyForWindow(
  windowId: number,
): string | null {
  return selectedMessageKeyByWindowId.get(windowId) ?? null;
}

export function forgetWindow(windowId: number): void {
  workspaceByWindowId.delete(windowId);
  activePageByWindowId.delete(windowId);
  selectedMessageKeyByWindowId.delete(windowId);
}

export function findWindowForWorkspace(
  workspaceId: string,
  candidates: BrowserWindow[],
): BrowserWindow | undefined {
  return candidates.find(
    (window) =>
      !window.isDestroyed() &&
      workspaceByWindowId.get(window.id) === workspaceId,
  );
}
