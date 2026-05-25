import { Injectable, signal } from '@angular/core';
import { Workspace } from '@service-bus-browser/shared-contracts';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly _activeWorkspace = signal<Workspace | undefined>(undefined);
  readonly activeWorkspace = this._activeWorkspace.asReadonly();

  initialize(workspace: Workspace): void {
    this._activeWorkspace.set(workspace);
  }
}
