import { Injectable, signal } from '@angular/core';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  /**
   * localStorage key for the active workspace id. The active selection is UI
   * state, so it's stored in localStorage on both desktop and web — the
   * registry of available workspaces lives elsewhere (encrypted file on
   * desktop, localStorage on web) but the *active* pointer is uniform.
   */
  private static readonly ACTIVE_WORKSPACE_ID_KEY = 'sbb-active-workspace-id';

  private readonly _activeWorkspace = signal<Workspace | undefined>(undefined);
  readonly activeWorkspace = this._activeWorkspace.asReadonly();

  /**
   * Picks the active workspace from the available list. Reads the last-active
   * id from localStorage; if it's missing or no longer present in the list
   * (e.g. that workspace was deleted on another machine, or this is first
   * boot), falls back to the first workspace and writes it back.
   */
  initialize(workspaces: Workspace[]): Workspace {
    if (workspaces.length === 0) {
      throw new Error('Cannot initialize WorkspaceService with empty workspace list');
    }

    const storedId = localStorage.getItem(
      WorkspaceService.ACTIVE_WORKSPACE_ID_KEY,
    ) as UUID | null;

    const active =
      (storedId && workspaces.find((w) => w.id === storedId)) ?? workspaces[0];

    if (storedId !== active.id) {
      localStorage.setItem(
        WorkspaceService.ACTIVE_WORKSPACE_ID_KEY,
        active.id,
      );
    }

    this._activeWorkspace.set(active);
    return active;
  }
}
