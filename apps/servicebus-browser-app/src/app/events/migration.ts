import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { WorkspaceStorage } from './secure-storage/workspace-storage';
import { SecureConnectionStorage } from './secure-storage/connection-storage';
import { UUID } from '@service-bus-browser/shared-contracts';

export interface MigrationResult {
  activeWorkspaceId: UUID;
}

/**
 * Runs idempotent startup migration.
 *
 * - If sbb-workspaces.json is absent: creates it with one "Default" workspace
 *   and migrates sbb-connections.json to stamp workspaceId on every connection.
 * - If sbb-workspaces.json is present but the connections backup still exists:
 *   retries the connections migration (covers a partial failure on a prior boot).
 * - If everything is already migrated: returns immediately.
 */
export function runMigration(userDataFolder: string): MigrationResult {
  const workspaceStorage = new WorkspaceStorage(userDataFolder);
  const connectionStorage = new SecureConnectionStorage(userDataFolder);
  const backupPath = connectionStorage.connectionsPath + '.v0.bak';

  if (!workspaceStorage.exists()) {
    // First migration: create the workspace registry
    const workspaceId = randomUUID() as UUID;
    const now = new Date().toISOString();

    workspaceStorage.write({
      version: 1,
      workspaces: [{ id: workspaceId, name: 'Default', createdAt: now }],
      activeWorkspaceId: workspaceId,
    });

    migrateConnections(connectionStorage, workspaceId, backupPath);

    return { activeWorkspaceId: workspaceId };
  }

  // Already have workspace file — check if a prior connections migration was interrupted
  const data = workspaceStorage.read()!;
  if (fs.existsSync(backupPath)) {
    migrateConnections(connectionStorage, data.activeWorkspaceId, backupPath);
  }

  return { activeWorkspaceId: data.activeWorkspaceId };
}

function migrateConnections(
  storage: SecureConnectionStorage,
  workspaceId: UUID,
  backupPath: string,
): void {
  if (!fs.existsSync(storage.connectionsPath)) {
    return;
  }

  // Backup the current file before rewriting
  fs.copyFileSync(storage.connectionsPath, backupPath);

  try {
    const connections = storage.readCurrentConnections();
    const migrated = Object.fromEntries(
      Object.entries(connections).map(([id, conn]) => [
        id,
        { ...conn, workspaceId },
      ]),
    ) as Parameters<typeof storage.writeConnections>[0];

    storage.writeConnections(migrated);

    // Migration complete — remove the backup
    fs.unlinkSync(backupPath);
  } catch (error) {
    // Restore from backup so the app stays functional on next boot
    fs.copyFileSync(backupPath, storage.connectionsPath);
    fs.unlinkSync(backupPath);
    throw error;
  }
}
