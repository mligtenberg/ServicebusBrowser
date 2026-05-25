import { WorkspacesServerFunc } from './types';

const getActiveWorkspace: WorkspacesServerFunc = async (_body, store) => {
  return store.getActiveWorkspace();
};

export default new Map<string, WorkspacesServerFunc>([
  ['getActiveWorkspace', getActiveWorkspace],
]);
