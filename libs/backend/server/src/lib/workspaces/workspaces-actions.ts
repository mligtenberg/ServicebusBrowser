import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspacesServerFunc } from './types';

const listWorkspaces: WorkspacesServerFunc = async (_body, store) => {
  return store.listWorkspaces();
};

const createWorkspace: WorkspacesServerFunc = async (body, store) => {
  const { name } = body as { name: string };
  const workspace: Workspace = {
    id: crypto.randomUUID() as UUID,
    name,
    createdAt: new Date().toISOString(),
  };
  store.createWorkspace(workspace);
  return workspace;
};

const setActiveWorkspace: WorkspacesServerFunc = async (body, store) => {
  const { id } = body as { id: UUID };
  store.setActiveWorkspaceId(id);
};

const renameWorkspace: WorkspacesServerFunc = async (body, store) => {
  const { id, name } = body as { id: UUID; name: string };
  store.renameWorkspace(id, name);
};

const deleteWorkspace: WorkspacesServerFunc = async (body, store) => {
  const { id } = body as { id: UUID };
  store.deleteConnectionsByWorkspace(id);
  store.deleteWorkspace(id);
};

const countConnectionsByWorkspace: WorkspacesServerFunc = async (body, store) => {
  const { id } = body as { id: UUID };
  return store.countConnectionsByWorkspace(id);
};

export default new Map<string, WorkspacesServerFunc>([
  ['listWorkspaces', listWorkspaces],
  ['createWorkspace', createWorkspace],
  ['setActiveWorkspace', setActiveWorkspace],
  ['renameWorkspace', renameWorkspace],
  ['deleteWorkspace', deleteWorkspace],
  ['countConnectionsByWorkspace', countConnectionsByWorkspace],
]);
