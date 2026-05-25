import { MessagesRepository } from './lib/messages-repository';
import { getPagesDb, initializeWorkspace, migrateOpfsFiles } from './lib/get-database';
import { UUID } from '@service-bus-browser/shared-contracts';

export { initializeWorkspace, migrateOpfsFiles };

let repositoryPromise: Promise<MessagesRepository> | undefined;

export async function getMessagesRepository() {
  if (!repositoryPromise) {
    repositoryPromise = getPagesDb().then((db) => new MessagesRepository(db));
  }

  return await repositoryPromise;
}

export async function getPageIds(): Promise<UUID[]> {
  const db = await getPagesDb();
  const pages = await db.getPages();
  return pages.map((p) => p.id);
}
