import { BrowserWindow } from 'electron';

/**
 * Tracks which workspace each open app window is currently showing, reported
 * by the renderer (on boot and on every switch). Used to detect "this
 * workspace is already open somewhere" before opening it again.
 */
const workspaceByWindowId = new Map<number, string>();

export function setActiveWorkspaceForWindow(
  windowId: number,
  workspaceId: string,
): void {
  workspaceByWindowId.set(windowId, workspaceId);
}

export function forgetWindow(windowId: number): void {
  workspaceByWindowId.delete(windowId);
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
