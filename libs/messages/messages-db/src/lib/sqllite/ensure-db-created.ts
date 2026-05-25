import { Database } from './database';

export async function ensurePagesDbCreated(database: Database, workspaceId: string) {
  await database.exec(`CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    name TEXT,
    retrievedAt DATETIME,
    workspaceId TEXT
  )`);

  // Schema v1: add workspaceId column to existing tables that predate it,
  // then backfill rows that have no workspace assignment yet.
  const userVersion = await getUserVersion(database);
  if (userVersion < 1) {
    await migrateToV1(database, workspaceId);
  }
}

async function getUserVersion(database: Database): Promise<number> {
  const result = await database.exec('PRAGMA user_version') as any;
  const rows = result?.result?.resultRows ?? result?.resultRows ?? [];
  return rows[0]?.[0] ?? 0;
}

async function migrateToV1(database: Database, workspaceId: string): Promise<void> {
  // Add workspaceId column if it doesn't exist (catches tables created before
  // the column was part of CREATE TABLE). Swallow the "duplicate column" error.
  try {
    await database.exec(`ALTER TABLE pages ADD COLUMN workspaceId TEXT`);
  } catch {
    // column already exists — no-op
  }

  // Backfill all rows that have no workspace yet
  await database.exec(
    `UPDATE pages SET workspaceId = ? WHERE workspaceId IS NULL OR workspaceId = ''`,
    [workspaceId],
  );

  await database.exec(`PRAGMA user_version = 1`);
}

export async function ensureMessagesDbCreated(database: Database) {
  await createMessages(database);
  await createPropertyLabelTable(database);
  await createHeaders(database);
  await createProperties(database);
  await createDeliveryAnnotations(database);
  await createMessageAnnotations(database);
  await createApplicationProperties(database);
  await createSettings(database);
}

async function createSettings(database: Database) {
  await database.exec(`CREATE TABLE IF NOT EXISTS settings (
    settingKey TEXT PRIMARY KEY,
    settingValue TEXT
  )`);
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
  await createGenericProperties(database, 'applicationProperties');
}
