import { MessagesRepository } from './lib/messages-repository';
import { getPagesDb } from './lib/database';

const repository = getPagesDb()
.then(db => new MessagesRepository(db));

export async function getMessagesRepository() {
  return await repository;
}
