import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

jest.mock('electron', () => ({
  safeStorage: {
    encryptString: (s: string) => Buffer.from(s, 'utf8'),
    decryptString: (b: Buffer) => b.toString('utf8'),
  },
}));

import { SecureConnectionStorage } from './connection-storage';
import { WorkspaceStorage } from './workspace-storage';

const workspaceA = 'workspace-a' as UUID;
const workspaceB = 'workspace-b' as UUID;

const makeConnection = (
  id: string,
  name: string,
  workspaceId?: UUID,
): Connection => ({
  id: id as UUID,
  type: 'connectionString',
  target: 'serviceBus',
  name,
  connectionString: 'Endpoint=sb://example/',
  workspaceId,
});

describe('SecureConnectionStorage', () => {
  let tmpDir: string;
  let workspaceStorage: WorkspaceStorage;
  let storage: SecureConnectionStorage;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbb-connection-storage-'));
    workspaceStorage = new WorkspaceStorage(tmpDir);
    storage = new SecureConnectionStorage(tmpDir, workspaceStorage);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('scopes listConnections by the explicit workspaceId, regardless of the ambient active workspace', () => {
    workspaceStorage.setActiveWorkspaceId(workspaceA);

    storage.addConnection(makeConnection('conn-a', 'A', workspaceA));
    storage.addConnection(makeConnection('conn-b', 'B', workspaceB));

    expect(storage.listConnections(workspaceB)).toEqual([
      { connectionId: 'conn-b', connectionName: 'B' },
    ]);
  });

  it('tags addConnection with the workspaceId already set on the connection, not the ambient active one', () => {
    workspaceStorage.setActiveWorkspaceId(workspaceA);

    storage.addConnection(makeConnection('conn-b', 'B', workspaceB));

    expect(storage.getConnection('conn-b' as UUID)?.workspaceId).toBe(workspaceB);
  });

  it('addConnection falls back to the ambient active workspace when the connection has no workspaceId', () => {
    workspaceStorage.setActiveWorkspaceId(workspaceA);

    storage.addConnection(makeConnection('conn-a', 'A'));

    expect(storage.listConnections(workspaceA)).toEqual([
      { connectionId: 'conn-a', connectionName: 'A' },
    ]);
    expect(storage.listConnections(workspaceB)).toEqual([]);
  });

  it('renameConnection only renames connections visible in the given workspace', () => {
    storage.addConnection(makeConnection('conn-a', 'A', workspaceA));

    storage.renameConnection('conn-a' as UUID, 'Renamed', workspaceB);
    expect(storage.getConnection('conn-a' as UUID)?.name).toBe('A');

    storage.renameConnection('conn-a' as UUID, 'Renamed', workspaceA);
    expect(storage.getConnection('conn-a' as UUID)?.name).toBe('Renamed');
  });

  it('renameConnection falls back to the ambient active workspace when no workspaceId is given', () => {
    workspaceStorage.setActiveWorkspaceId(workspaceB);
    storage.addConnection(makeConnection('conn-a', 'A', workspaceA));

    storage.renameConnection('conn-a' as UUID, 'Renamed', undefined);
    expect(storage.getConnection('conn-a' as UUID)?.name).toBe('A');

    workspaceStorage.setActiveWorkspaceId(workspaceA);
    storage.renameConnection('conn-a' as UUID, 'Renamed', undefined);
    expect(storage.getConnection('conn-a' as UUID)?.name).toBe('Renamed');
  });

  it('removeConnection only removes connections visible in the given workspace', () => {
    storage.addConnection(makeConnection('conn-a', 'A', workspaceA));

    storage.removeConnection('conn-a' as UUID, workspaceB);
    expect(storage.getConnection('conn-a' as UUID)).toBeDefined();

    storage.removeConnection('conn-a' as UUID, workspaceA);
    expect(storage.getConnection('conn-a' as UUID)).toBeUndefined();
  });
});
