import { UUID, Workspace } from '@service-bus-browser/shared-contracts';

export interface WorkspaceStore {
  listWorkspaces(): Workspace[];
  createWorkspace(workspace: Workspace): void;
  setActiveWorkspaceId(id: UUID): void;
  renameWorkspace(id: UUID, name: string): void;
  deleteWorkspace(id: UUID): void;
  countConnectionsByWorkspace(id: UUID): number;
  deleteConnectionsByWorkspace(id: UUID): void;
}

export type WorkspacesServerFunc = (
  body: any,
  store: WorkspaceStore,
) => Promise<any>;
