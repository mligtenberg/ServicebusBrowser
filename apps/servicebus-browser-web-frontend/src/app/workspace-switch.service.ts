import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';
import { messagePagesEffectActions } from '@service-bus-browser/messages-store';
import {
  switchMessagesDbWorkspace,
  migrateOpfsFiles,
  initializeWorkspace,
  getMessagesRepository,
} from '@service-bus-browser/messages-db';
import { pagesActions } from '@service-bus-browser/main-ui';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { TasksActions } from '@service-bus-browser/tasks-store';

/**
 * Coordinates a full workspace activation for the web variant: persists
 * (when explicit) the active workspace, resets or brings up the messages-db
 * cache, and tears down + rehydrates all NgRx stores. Used both for explicit
 * switches and for the route guard's URL-driven activation on boot and on
 * live `:workspaceId` changes.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceSwitchService {
  private readonly store = inject(Store);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly router = inject(Router);

  /**
   * `persist: true` is an explicit switch action — it writes the
   * localStorage last-active pointer. `persist: false` is a route-guard
   * activation (boot, or a live address-bar/back-forward change) — it only
   * updates the in-memory signal, per ADR-0009.
   */
  async activate(workspace: Workspace, options: { persist: boolean }): Promise<void> {
    const isFirstActivationInThisWindow = !this.workspaceService.activeWorkspace();

    this.store.dispatch(TasksActions.cancelAllTasks());

    if (options.persist) {
      await this.workspaceService.setActive(workspace);
    } else {
      this.workspaceService.activateInMemory(workspace);
    }

    if (isFirstActivationInThisWindow) {
      try {
        await migrateOpfsFiles(workspace.id);
      } catch (err) {
        console.warn('OPFS migration failed; will retry on next boot:', err);
      }
      initializeWorkspace(workspace.id);
      await getMessagesRepository();
    } else {
      switchMessagesDbWorkspace(workspace.id);
      this.store.dispatch(messagePagesEffectActions.workspaceSwitched());
    }

    this.store.dispatch(pagesActions.workspaceActivated({ workspaceId: workspace.id }));
    this.store.dispatch(TopologyActions.loadTopologyRootNodes());
  }

  /** Explicit switch, triggered by the workspace switcher. Always resets to the workspace's default route — any open queue/topic/message page belongs to the workspace just left and can no longer resolve. */
  async switchTo(workspace: Workspace): Promise<void> {
    await this.activate(workspace, { persist: true });
    await this.router.navigateByUrl(this.workspaceService.workspaceUrl('/', workspace.id));
  }
}
