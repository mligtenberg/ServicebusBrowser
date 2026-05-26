import { UUID } from '@service-bus-browser/shared-contracts';
import { MessagesRepository } from './lib/messages-repository';
import { getPagesDb, initializeWorkspace, getActiveWorkspaceId, migrateOpfsFiles, switchDatabaseWorkspace } from './lib/get-database';

export { initializeWorkspace, getActiveWorkspaceId, migrateOpfsFiles };

let repositoryPromise: Promise<MessagesRepository> | undefined;

export async function getMessagesRepository() {
  if (!repositoryPromise) {
    repositoryPromise = getPagesDb().then((db) => new MessagesRepository(db));
  }

  return await repositoryPromise;
}

/**
 * Switches the active workspace for all database access. Resets the cached
 * repository and PagesDatabase so subsequent calls open connections scoped
 * to the new workspace.
 */
export function switchMessagesDbWorkspace(workspaceId: UUID): void {
  switchDatabaseWorkspace(workspaceId);
  repositoryPromise = undefined;
}
