import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspacesApiHandler } from './workspaces-api-handler';

export class WorkspacesFrontendClient {
  constructor(private workspacesApi: WorkspacesApiHandler) {}

  async getActiveWorkspace(): Promise<Workspace | null> {
    return (await this.workspacesApi.workspacesDoRequest(
      'getActiveWorkspace',
      {},
    )) as Workspace | null;
  }
}
