import { BrowserWindow } from 'electron';

/**
 * Tracks which workspace each open app window is currently showing, reported
 * by the renderer (on boot and on every switch). Used to detect "this
 * workspace is already open somewhere" before opening it again.
 */
const workspaceByWindowId = new Map<number, string>();

/**
 * The id of the window that most recently received OS focus, updated by a
 * `focus` listener registered on every window in `app.ts`'s `createWindow()`.
 * Backs "the active window" for MCP tools (`get_active_workspace`,
 * `open_message_page`) — distinct from `App.windows`' array order, which is
 * creation order, not focus order. `getActiveWindow()` below falls back to
 * the most recently created window if nothing has been focused yet (or the
 * last-focused one has since closed).
 */
let lastFocusedWindowId: number | undefined;

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
  if (lastFocusedWindowId === windowId) {
    lastFocusedWindowId = undefined;
  }
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

/**
 * The set of Workspace ids currently shown by at least one open window —
 * backs `list_workspaces`' `openWorkspaceIds`, so an MCP client can tell
 * which Workspaces `focus_workspace_window`/`navigate_to_topology_node`
 * (which require an already-open window) can actually target.
 */
export function getOpenWorkspaceIds(candidates: BrowserWindow[]): string[] {
  const ids = new Set<string>();
  for (const window of candidates) {
    if (window.isDestroyed()) {
      continue;
    }
    const workspaceId = workspaceByWindowId.get(window.id);
    if (workspaceId) {
      ids.add(workspaceId);
    }
  }
  return [...ids];
}

export function setLastFocusedWindow(windowId: number): void {
  lastFocusedWindowId = windowId;
}

/**
 * Resolves "the active window" for MCP tools: the last-focused window (see
 * above) if it's still open, else the most recently created one — mirroring
 * the fallback `get_active_page`/`get_selected_message` already used before
 * this existed, so those keep working even if the app has never been
 * focused (e.g. driven entirely over MCP with the window backgrounded).
 */
export function getActiveWindow(
  candidates: BrowserWindow[],
): BrowserWindow | undefined {
  const open = candidates.filter((window) => !window.isDestroyed());
  const focused = open.find((window) => window.id === lastFocusedWindowId);
  return focused ?? open[open.length - 1];
}
