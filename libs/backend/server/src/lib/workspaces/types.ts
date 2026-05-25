import { UUID, Workspace } from '@service-bus-browser/shared-contracts';

export interface WorkspaceStore {
  listWorkspaces(): Workspace[];
  createWorkspace(workspace: Workspace): void;
  setActiveWorkspaceId(id: UUID): void;
}

export type WorkspacesServerFunc = (
  body: any,
  store: WorkspaceStore,
) => Promise<any>;
