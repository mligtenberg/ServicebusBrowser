import { Workspace } from '@service-bus-browser/shared-contracts';

export interface WorkspaceStore {
  listWorkspaces(): Workspace[];
}

export type WorkspacesServerFunc = (
  body: any,
  store: WorkspaceStore,
) => Promise<any>;
