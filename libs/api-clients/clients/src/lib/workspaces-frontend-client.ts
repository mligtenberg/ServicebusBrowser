import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { BackendApi } from './backend-api';

export class WorkspacesFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async listWorkspaces(): Promise<Workspace[]> {
    return (await this.backendApi.workspacesDoRequest(
      'listWorkspaces',
      {},
    )) as Workspace[];
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return (await this.backendApi.workspacesDoRequest(
      'createWorkspace',
      { name },
    )) as Workspace;
  }

  async setActiveWorkspaceId(id: UUID): Promise<void> {
    await this.backendApi.workspacesDoRequest('setActiveWorkspace', { id });
  }
}
