import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';
import { messagePagesEffectActions } from '@service-bus-browser/messages-store';
import { switchMessagesDbWorkspace } from '@service-bus-browser/messages-db';
import { pagesActions } from '@service-bus-browser/main-ui';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { TasksActions } from '@service-bus-browser/tasks-store';

/**
 * Coordinates a full workspace switch: persists the active workspace,
 * resets the messages-db cache, and tears down + rehydrates all NgRx stores.
 * Used by both "create then switch" and explicit workspace selection flows.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceSwitchService {
  private readonly store = inject(Store);
  private readonly workspaceService = inject(WorkspaceService);

  async switchTo(workspace: Workspace): Promise<void> {
    this.store.dispatch(TasksActions.cancelAllTasks());
    await this.workspaceService.setActive(workspace);
    switchMessagesDbWorkspace(workspace.id);
    this.store.dispatch(messagePagesEffectActions.workspaceSwitched());
    this.store.dispatch(pagesActions.workspaceActivated({ workspaceId: workspace.id }));
    this.store.dispatch(TopologyActions.loadTopologyRootNodes());
  }

  async createAndSwitch(name: string): Promise<Workspace> {
    const workspace = await this.workspaceService.createWorkspace(name);
    await this.switchTo(workspace);
    return workspace;
  }
}
