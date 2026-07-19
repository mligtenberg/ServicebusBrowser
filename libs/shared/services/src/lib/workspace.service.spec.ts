import { TestBed } from '@angular/core/testing';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { WorkspaceService } from './workspace.service';

function workspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'ws-1',
    name: 'Original',
    createdAt: '2026-01-01T00:00:00.000Z',
    primaryColor: '#111111',
    ...overrides,
  };
}

describe('WorkspaceService', () => {
  let client: jest.Mocked<Pick<WorkspacesFrontendClient, 'updateWorkspace'>>;
  let service: WorkspaceService;

  beforeEach(() => {
    client = { updateWorkspace: jest.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      providers: [{ provide: WorkspacesFrontendClient, useValue: client }],
    });
    service = TestBed.inject(WorkspaceService);
    const initial = workspace();
    service.addWorkspace(initial);
    service.activateInMemory(initial);
  });

  it('updateWorkspace persists via the API and updates the signals', async () => {
    await service.updateWorkspace('ws-1', { name: 'Renamed', primaryColor: '#222222' });

    expect(client.updateWorkspace).toHaveBeenCalledWith('ws-1', {
      name: 'Renamed',
      primaryColor: '#222222',
    });
    expect(service.availableWorkspaces()[0].name).toBe('Renamed');
    expect(service.activeWorkspace()?.name).toBe('Renamed');
  });

  it('applyWorkspaceUpdate updates the signals without calling the API', () => {
    // Mirrors what a *different* process (e.g. the edit-workspace popup, a
    // separate Electron renderer with its own WorkspaceService instance)
    // already persisted — the main window just needs to reflect it, not
    // persist it again.
    service.applyWorkspaceUpdate('ws-1', { name: 'Renamed elsewhere' });

    expect(client.updateWorkspace).not.toHaveBeenCalled();
    expect(service.availableWorkspaces()[0].name).toBe('Renamed elsewhere');
    expect(service.activeWorkspace()?.name).toBe('Renamed elsewhere');
  });

  it('applyWorkspaceUpdate leaves other workspaces and the active pointer untouched', () => {
    service.addWorkspace(workspace({ id: 'ws-2', name: 'Other' }));

    service.applyWorkspaceUpdate('ws-2', { name: 'Other renamed' });

    expect(service.availableWorkspaces().map((w) => w.name)).toEqual([
      'Original',
      'Other renamed',
    ]);
    // ws-1 is still active; updating ws-2 must not touch it.
    expect(service.activeWorkspace()?.id).toBe('ws-1');
    expect(service.activeWorkspace()?.name).toBe('Original');
  });

  describe('workspaceUrl', () => {
    it('builds a clean workspace-root URL with no trailing slash', () => {
      expect(service.workspaceUrl('/')).toBe('/ws-1');
      expect(service.workspaceUrl('')).toBe('/ws-1');
    });

    it('builds a sub-path URL, defaulting to the active workspace', () => {
      expect(service.workspaceUrl('/messages/send')).toBe('/ws-1/messages/send');
      expect(service.workspaceUrl('messages')).toBe('/ws-1/messages');
    });

    it('uses an explicit workspace id over the active one', () => {
      expect(service.workspaceUrl('/', 'ws-2')).toBe('/ws-2');
    });
  });
});
