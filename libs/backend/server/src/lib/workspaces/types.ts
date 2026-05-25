import { Workspace } from '@service-bus-browser/shared-contracts';

export interface WorkspaceStore {
  getActiveWorkspace(): Workspace | null;
}

export type WorkspacesServerFunc = (
  body: any,
  store: WorkspaceStore,
) => Promise<any>;
