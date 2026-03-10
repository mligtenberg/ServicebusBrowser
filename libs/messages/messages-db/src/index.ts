import { MessagesRepository } from './lib/messages-repository';
import { getPagesDb } from './lib/get-database';

let repositoryPromise: Promise<MessagesRepository> | undefined;

export async function getMessagesRepository() {
  if (!repositoryPromise) {
    repositoryPromise = getPagesDb().then((db) => new MessagesRepository(db));
  }

  return await repositoryPromise;
}

