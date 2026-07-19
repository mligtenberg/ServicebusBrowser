import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';
import { messagePagesEffectActions } from '@service-bus-browser/messages-store';
import { switchMessagesDbWorkspace } from '@service-bus-browser/messages-db';
import { pagesActions } from '@service-bus-browser/main-ui';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { WorkspaceWindowService } from './workspace-window.service';

/**
 * Coordinates a full workspace switch: persists the active workspace,
 * resets the messages-db cache, and tears down + rehydrates all NgRx stores.
 * Used by both "create then switch" and explicit workspace selection flows.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceSwitchService {
  private readonly store = inject(Store);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly workspaceWindowService = inject(WorkspaceWindowService);
  private readonly router = inject(Router);

  async switchTo(workspace: Workspace): Promise<void> {
    this.store.dispatch(TasksActions.cancelAllTasks());
    await this.workspaceService.setActive(workspace);
    this.workspaceWindowService.reportActive(workspace.id);
    switchMessagesDbWorkspace(workspace.id);
    this.store.dispatch(messagePagesEffectActions.workspaceSwitched());
    this.store.dispatch(pagesActions.workspaceActivated({ workspaceId: workspace.id }));
    this.store.dispatch(TopologyActions.loadTopologyRootNodes());
    // Any open queue/topic/message page belongs to the workspace we just
    // left (different connection ids), so it can no longer resolve.
    await this.router.navigateByUrl('/');
  }

  async createAndSwitch(name: string, primaryColor?: string): Promise<Workspace> {
    const workspace = await this.workspaceService.createWorkspace(name, primaryColor);
    await this.switchTo(workspace);
    return workspace;
  }
}
