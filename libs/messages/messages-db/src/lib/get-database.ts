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

// Single shared promise so concurrent callers all wait for the same
// initialization rather than each racing to open the same SQLite file.
let dbPromise: Promise<PagesDatabase> | undefined;

export async function getPagesDb(): Promise<PagesDatabase> {
  const workspaceId = await workspaceReadyPromise;

  if (!dbPromise) {
    const pagesDb = new SqlitePagesDatabase();
    dbPromise = pagesDb.initialize(workspaceId).then(() => pagesDb);
  }

  return dbPromise;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Migrates per-page SQLite files from the flat OPFS layout used before
 * workspace support (sqlite/{pageId}.sqlite3) to the workspace-scoped layout
 * (sqlite/{workspaceId}/{pageId}.sqlite3).
 *
 * Scans the OPFS sqlite/ directory directly — no page DB access needed —
 * so it can safely run before any SQLite database is opened.
 *
 * Idempotent: already-migrated files are skipped. On partial failure the
 * function returns normally — missing files are retried on the next call.
 */
export async function migrateOpfsFiles(workspaceId: UUID): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();
  let sqliteRoot: FileSystemDirectoryHandle;
  try {
    sqliteRoot = await opfsRoot.getDirectoryHandle('sqlite');
  } catch {
    return; // no sqlite directory yet — nothing to migrate
  }

  const workspaceDir = await sqliteRoot.getDirectoryHandle(workspaceId, { create: true });
  const toMove: string[] = [];

  for await (const [name, handle] of (sqliteRoot as any).entries()) {
    if (handle.kind !== 'file') continue;
    if (!name.endsWith('.sqlite3')) continue;
    const pageId = name.slice(0, -'.sqlite3'.length);
    if (!UUID_REGEX.test(pageId)) continue; // skip pages.sqlite3 and other non-page files
    toMove.push(pageId);
  }

  for (const pageId of toMove) {
    try {
      await workspaceDir.getFileHandle(`${pageId}.sqlite3`);
      continue; // already at the new location
    } catch {
      // not yet migrated
    }

    try {
      const oldHandle = await sqliteRoot.getFileHandle(`${pageId}.sqlite3`);
      const newHandle = await workspaceDir.getFileHandle(`${pageId}.sqlite3`, { create: true });
      const oldFile = await oldHandle.getFile();
      const writable: WritableStream = await (newHandle as any).createWritable();
      // Stream the file rather than buffering the whole DB in memory — message
      // page databases can be large. pipeTo handles backpressure and closes
      // the writable when the source ends.
      await oldFile.stream().pipeTo(writable);
      await sqliteRoot.removeEntry(`${pageId}.sqlite3`);
    } catch (err) {
      console.warn(`Failed to migrate OPFS file for page ${pageId}:`, err);
    }
  }
}
