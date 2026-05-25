import { WorkspacesServerFunc } from './types';

const listWorkspaces: WorkspacesServerFunc = async (_body, store) => {
  return store.listWorkspaces();
};

export default new Map<string, WorkspacesServerFunc>([
  ['listWorkspaces', listWorkspaces],
]);
