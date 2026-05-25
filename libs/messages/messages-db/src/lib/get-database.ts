import { Page } from './models/page';
import { SqliteMessagesDatabase } from './sqlite-messages.database';
import { MessagesDatabase } from './messages-database';
import { PagesDatabase } from './pages-database';
import { SqlitePagesDatabase } from './sqlite-pages.database';
import { UUID } from '@service-bus-browser/shared-contracts';

// Resolved by initializeWorkspace(). Any caller that awaits
// workspaceReadyPromise will suspend until the APP_INITIALIZER runs,
// rather than throwing synchronously at module-load time (which would
// happen before the initializer has a chance to run).
let workspaceResolve!: (id: UUID) => void;
const workspaceReadyPromise = new Promise<UUID>((resolve) => {
  workspaceResolve = resolve;
});

let activeWorkspaceId: UUID | undefined;

/** Called by the APP_INITIALIZER before any database is accessed. */
export function initializeWorkspace(workspaceId: UUID): void {
  activeWorkspaceId = workspaceId;
  workspaceResolve(workspaceId);
}

export function getActiveWorkspaceId(): UUID {
  if (!activeWorkspaceId) {
    throw new Error('Workspace not initialized. Call initializeWorkspace() before accessing databases.');
  }
  return activeWorkspaceId;
}

let db: PagesDatabase | undefined;

export async function getPagesDb(): Promise<PagesDatabase> {
  // Wait for the APP_INITIALIZER to call initializeWorkspace()
  const workspaceId = await workspaceReadyPromise;

  if (db) {
    return db;
  }

  const pagesDb = new SqlitePagesDatabase();
  await pagesDb.initialize(workspaceId);
  db = pagesDb;
  return db;
}

const dbs: Record<string, MessagesDatabase> = {};

export async function getMessagesDb(page: Page): Promise<MessagesDatabase> {
  const workspaceId = await workspaceReadyPromise;
  const dbKey = `${workspaceId}/${page.id}`;

  if (dbKey in dbs) {
    const existing = dbs[dbKey];
    if (existing instanceof SqliteMessagesDatabase) {
      await existing.initialize();
    }
    return existing;
  }

  const messagesDb = new SqliteMessagesDatabase(page.id, workspaceId);
  dbs[dbKey] = messagesDb;
  await messagesDb.initialize();
  return messagesDb;
}

/**
 * Migrates per-page SQLite files from the flat OPFS layout used before
 * workspace support (sqlite/{pageId}.sqlite3) to the workspace-scoped layout
 * (sqlite/{workspaceId}/{pageId}.sqlite3).
 *
 * Idempotent: already-migrated files are skipped. On partial failure the
 * function returns normally — missing files are retried on the next call
 * (i.e. next boot).
 */
export async function migrateOpfsFiles(workspaceId: UUID, pageIds: UUID[]): Promise<void> {
  if (!pageIds.length) return;

  const opfsRoot = await navigator.storage.getDirectory();
  let sqliteRoot: FileSystemDirectoryHandle;
  try {
    sqliteRoot = await opfsRoot.getDirectoryHandle('sqlite');
  } catch {
    return; // no sqlite directory yet — nothing to migrate
  }

  const workspaceDir = await sqliteRoot.getDirectoryHandle(workspaceId, { create: true });

  for (const pageId of pageIds) {
    try {
      // Already at the new location → skip
      await workspaceDir.getFileHandle(`${pageId}.sqlite3`);
      continue;
    } catch {
      // not yet migrated
    }

    let oldHandle: FileSystemFileHandle | undefined;
    try {
      oldHandle = await sqliteRoot.getFileHandle(`${pageId}.sqlite3`);
    } catch {
      continue; // old file doesn't exist either — skip
    }

    try {
      const newHandle = await workspaceDir.getFileHandle(`${pageId}.sqlite3`, { create: true });
      const oldFile = await oldHandle.getFile();
      const buffer = await oldFile.arrayBuffer();
      const writable = await (newHandle as any).createWritable();
      await writable.write(buffer);
      await writable.close();
      await sqliteRoot.removeEntry(`${pageId}.sqlite3`);
    } catch (err) {
      console.warn(`Failed to migrate OPFS file for page ${pageId}:`, err);
      // continue with the next page — this one will be retried on next boot
    }
  }
}
