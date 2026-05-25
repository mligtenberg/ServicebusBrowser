import { WorkspaceStore } from './types';
import workspacesOperations from './workspaces-actions';

export class WorkspacesServer {
  constructor(private readonly store: WorkspaceStore) {}

  workspacesExecute(actionName: string, requestBody: unknown) {
    if (workspacesOperations.has(actionName)) {
      const func = workspacesOperations.get(actionName);
      return (
        func?.(requestBody, this.store) ??
        Promise.reject('Action returned undefined')
      );
    }

    throw new Error(`Action ${actionName} not found`);
  }
}
