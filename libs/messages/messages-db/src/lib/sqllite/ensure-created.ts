import { Database } from './database';

export async function ensureCreated(database: Database) {
  await createMessages(database);
  await createIndexesForMessages(database);
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

export async function createIndexesForMessages(database: Database) {
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_id ON messages(id ASC)',
  )
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_contentType ON messages(contentType ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_correlationId ON messages(correlationId ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_deadLetterReason ON messages(deadLetterReason ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_deliveryCount ON messages(deliveryCount ASC)',
  );
  await database.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_enqueuedSequenceNumber ON messages(enqueuedSequenceNumber ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_enqueuedTimeUtc ON messages(enqueuedTimeUtc ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_expiresAtUtc ON messages(expiresAtUtc ASC)',
  );
  await database.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_messageId ON messages(messageId ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_partitionKey ON messages(partitionKey ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_scheduledEnqueueTimeUtc ON messages(scheduledEnqueueTimeUtc ASC)',
  );
  await database.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_sequenceNumber ON messages(sequenceNumber ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_sessionId ON messages(sessionId ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_messageState ON messages(messageState ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_subject ON messages(subject ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_timeToLive ON messages(timeToLive ASC)',
  );
  await database.exec(
    'CREATE INDEX IF NOT EXISTS idx_messages_messageTo ON messages(messageTo ASC)',
  );
}
