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

async function tableHasColumn(database: Database, table: string, column: string): Promise<boolean> {
  const result = await database.exec(`PRAGMA table_info(${table})`) as any;
  const rows: unknown[] = result?.result?.resultRows ?? result?.resultRows ?? [];
  // PRAGMA table_info returns rows of [cid, name, type, notnull, dflt_value, pk]
  return rows.some((row) => Array.isArray(row) && row[1] === column);
}

async function migrateToV1(database: Database, workspaceId: string): Promise<void> {
  // CREATE TABLE IF NOT EXISTS above already includes the workspaceId column
  // for fresh installs. For pre-existing tables that predate the column, add
  // it only when it's actually missing — that way any real exec failure
  // (lock contention, corruption, etc.) is no longer silently swallowed.
  if (!(await tableHasColumn(database, 'pages', 'workspaceId'))) {
    await database.exec(`ALTER TABLE pages ADD COLUMN workspaceId TEXT`);
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
