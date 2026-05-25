import { inject, Injectable, signal } from '@angular/core';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private static readonly ACTIVE_WORKSPACE_ID_KEY = 'sbb-active-workspace-id';

  private readonly _activeWorkspace = signal<Workspace | undefined>(undefined);
  readonly activeWorkspace = this._activeWorkspace.asReadonly();

  private readonly _availableWorkspaces = signal<Workspace[]>([]);
  readonly availableWorkspaces = this._availableWorkspaces.asReadonly();

  private readonly workspacesClient = inject(WorkspacesFrontendClient);

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

    this._availableWorkspaces.set(workspaces);

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

  /** Update active workspace signals + persist. Called by the coordinator. */
  async setActive(workspace: Workspace): Promise<void> {
    this._activeWorkspace.set(workspace);
    localStorage.setItem(WorkspaceService.ACTIVE_WORKSPACE_ID_KEY, workspace.id);
    await this.workspacesClient.setActiveWorkspaceId(workspace.id);
  }

  /** Add a newly created workspace to the available list. */
  addWorkspace(workspace: Workspace): void {
    this._availableWorkspaces.update((ws) => [...ws, workspace]);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    const workspace = await this.workspacesClient.createWorkspace(name);
    this.addWorkspace(workspace);
    return workspace;
  }
}
