import { MessagesRepository } from './lib/messages-repository';
import { getPagesDb, initializeWorkspace, getActiveWorkspaceId, migrateOpfsFiles } from './lib/get-database';

export { initializeWorkspace, getActiveWorkspaceId, migrateOpfsFiles };

let repositoryPromise: Promise<MessagesRepository> | undefined;

export async function getMessagesRepository() {
  if (!repositoryPromise) {
    repositoryPromise = getPagesDb().then((db) => new MessagesRepository(db));
  }

  return await repositoryPromise;
}
