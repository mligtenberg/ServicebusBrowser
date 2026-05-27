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

/** Returns the number of message pages owned by the given workspace. */
export async function countPagesByWorkspace(workspaceId: UUID): Promise<number> {
  const db = await getPagesDb();
  return db.countPagesByWorkspace(workspaceId);
}

/**
 * Deletes all data owned by the given workspace:
 * - Removes all page rows from the shared SQLite pages table.
 * - Drops the sqlite/{workspaceId}/ OPFS directory and all message files inside it.
 * - Removes the workspace entry from the pagesOrder localStorage key.
 */
export async function deleteWorkspaceData(workspaceId: UUID): Promise<void> {
  const db = await getPagesDb();
  await db.deletePagesByWorkspace(workspaceId);

  await dropWorkspaceOpfsDirectory(workspaceId);

  const PAGES_ORDER_KEY = 'pagesOrder';
  const stored = localStorage.getItem(PAGES_ORDER_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    delete parsed[workspaceId];
    localStorage.setItem(PAGES_ORDER_KEY, JSON.stringify(parsed));
  }
}

async function dropWorkspaceOpfsDirectory(workspaceId: UUID): Promise<void> {
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const sqliteRoot = await opfsRoot.getDirectoryHandle('sqlite');
    await sqliteRoot.removeEntry(workspaceId, { recursive: true });
  } catch {
    // Directory may not exist if the workspace had no message pages.
  }
}
