import { Database } from './database';


export async function ensureCreated(database: Database) {
  await createMessages(database);
  await createApplicationProperties(database);
}

async function createMessages(database: Database) {
  await database.exec(`CREATE TABLE IF NOT EXISTS messages
                       (
                         id TEXT PRIMARY KEY,
                         body string,
                         contentType TEXT,
                         correlationId TEXT,
                         deadLetterErrorDescription TEXT,
                         deadLetterReason TEXT,
                         deadLetterSource TEXT,
                         deliveryCount INTEGER,
                         enqueuedSequenceNumber INTEGER,
                         enqueuedTimeUtc TEXT,
                         expiresAtUtc TEXT,
                         lockToken TEXT,
                         lockedUntilUtc TEXT,
                         messageId TEXT,
                         partitionKey TEXT,
                         replyTo TEXT,
                         replyToSessionId TEXT,
                         scheduledEnqueueTimeUtc TEXT,
                         sequenceNumber TEXT,
                         sessionId TEXT,
                         messageState TEXT,
                         subject TEXT,
                         timeToLive TEXT,
                         messageTo TEXT,
                         message TEXT
                       )`);
}

async function createApplicationProperties(database: Database) {
  await database.exec(`CREATE TABLE IF NOT EXISTS applicationProperties (
    messageId TEXT,
    propertyName TEXT,
    propertyType TEXT,
    propertyValue TEXT,
    PRIMARY KEY(messageId, propertyName),
    FOREIGN KEY(messageId) REFERENCES messages(id)
    ON DELETE CASCADE ON UPDATE CASCADE
  )`);
}
