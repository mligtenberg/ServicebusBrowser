import { Injectable } from '@angular/core';

interface ElectronWindow {
  electron?: {
    reportActiveWorkspace?: (workspaceId: string) => void;
    focusWorkspaceWindowIfOpen?: (
      workspaceId: string,
    ) => Promise<{ found: boolean; sameWindow?: boolean }>;
    openWorkspaceInNewWindow?: (workspaceId: string) => Promise<void>;
  };
}

/**
 * Bridges the "which window has which workspace open" main-process registry.
 * A no-op everywhere the `electron` bridge isn't present (e.g. the web
 * frontend), same as the other optional-chained `window.electron` usages in
 * this app.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceWindowService {
  private readonly electron = (window as unknown as ElectronWindow).electron;

  /**
   * Whether the multi-window bridge exists at all — true only in the desktop
   * app. The web frontend has no `BrowserWindow`s to track, so callers should
   * skip the "focus/open elsewhere" flow entirely rather than relying on the
   * no-op methods below to silently do nothing.
   */
  readonly isAvailable = typeof this.electron?.focusWorkspaceWindowIfOpen === 'function';

  /** Tells main this window is now showing `workspaceId`. */
  reportActive(workspaceId: string): void {
    this.electron?.reportActiveWorkspace?.(workspaceId);
  }

  /**
   * If the workspace is already open — in this window or another — this
   * focuses the owning window (a no-op if it's this one). `found` tells the
   * caller not to open it again; `sameWindow` distinguishes "it's already
   * right here" from "we just focused a different window".
   */
  async focusIfOpenElsewhere(
    workspaceId: string,
  ): Promise<{ found: boolean; sameWindow: boolean }> {
    const result = await this.electron?.focusWorkspaceWindowIfOpen?.(
      workspaceId,
    );
    return {
      found: result?.found === true,
      sameWindow: result?.sameWindow === true,
    };
  }

  async openInNewWindow(workspaceId: string): Promise<void> {
    await this.electron?.openWorkspaceInNewWindow?.(workspaceId);
  }
}
