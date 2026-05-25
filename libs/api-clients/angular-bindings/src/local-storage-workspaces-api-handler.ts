import { Workspace, UUID } from '@service-bus-browser/shared-contracts';
import { WorkspacesApiHandler } from '@service-bus-browser/service-bus-frontend-clients';

/**
 * Web-variant handler. Workspaces live in localStorage because the web app has
 * no backend persistence for them — on first access, a "Default" workspace is
 * created and stored. Mirrors the on-disk behavior of the desktop variant
 * (sbb-workspaces.json) so the rest of the app can treat both identically.
 */
export class LocalStorageWorkspacesApiHandler implements WorkspacesApiHandler {
  private static readonly STORAGE_KEY = 'sbb-workspace';

  async workspacesDoRequest(
    requestType: string,
    _request: unknown,
  ): Promise<unknown> {
    switch (requestType) {
      case 'getActiveWorkspace':
        return this.getActiveWorkspace();
      default:
        throw new Error(`Unknown workspaces request: ${requestType}`);
    }
  }

  private getActiveWorkspace(): Workspace {
    const stored = localStorage.getItem(
      LocalStorageWorkspacesApiHandler.STORAGE_KEY,
    );
    if (stored) {
      return JSON.parse(stored) as Workspace;
    }

    const workspace: Workspace = {
      id: crypto.randomUUID() as UUID,
      name: 'Default',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      LocalStorageWorkspacesApiHandler.STORAGE_KEY,
      JSON.stringify(workspace),
    );
    return workspace;
  }
}
