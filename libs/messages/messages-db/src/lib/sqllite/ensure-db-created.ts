import { Database } from './database';

export async function ensurePagesDbCreated(database: Database) {
  await database.exec(`CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    name TEXT,
    retrievedAt DATETIME
  )`);
}

export async function ensureMessagesDbCreated(database: Database) {
  await createMessages(database);
  await createPropertyLabelTable(database);
  await createHeaders(database);
  await createProperties(database);
  await createDeliveryAnnotations(database);
  await createMessageAnnotations(database);
  await createApplicationProperties(database);
}

async function createMessages(database: Database) {
  await database.exec(`CREATE TABLE IF NOT EXISTS messages
                       (
                         id TEXT PRIMARY KEY,
                         contentType TEXT,
                         body string,
                         sequence INTEGER,
                         message TEXT
                       )`);
}

async function createPropertyLabelTable(database: Database) {
  await database.exec(
    `CREATE TABLE IF NOT EXISTS propertyLabels (
      propertyName TEXT PRIMARY KEY,
      propertyType TEXT,
      propertyLocation TEXT
    )`,
  );
}

async function createGenericProperties(database: Database, tableName: string) {
  await database.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (
                                                                 messageId TEXT,
                                                                 propertyName TEXT,
                                                                 propertyType TEXT,
                                                                 propertyValue TEXT,
                                                                 PRIMARY KEY(messageId, propertyName),
    FOREIGN KEY(messageId) REFERENCES messages(id)
    ON DELETE CASCADE ON UPDATE CASCADE
    )`);
}

async function createHeaders(database: Database) {
  await createGenericProperties(database, 'headers');
}


async function createProperties(database: Database) {
  await createGenericProperties(database, 'properties');
}

async function createDeliveryAnnotations(database: Database) {
  await createGenericProperties(database, 'deliveryAnnotations');
}

async function createMessageAnnotations(database: Database) {
  await createGenericProperties(database, 'messageAnnotations');
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
