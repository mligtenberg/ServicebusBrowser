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

  async createWorkspace(name: string, primaryColor?: string): Promise<Workspace> {
    return (await this.backendApi.workspacesDoRequest(
      'createWorkspace',
      { name, primaryColor },
    )) as Workspace;
  }

  async setActiveWorkspaceId(id: UUID): Promise<void> {
    await this.backendApi.workspacesDoRequest('setActiveWorkspace', { id });
  }

  async updateWorkspace(
    id: UUID,
    updates: { name?: string; primaryColor?: string },
  ): Promise<void> {
    await this.backendApi.workspacesDoRequest('updateWorkspace', {
      id,
      ...updates,
    });
  }

  async deleteWorkspace(id: UUID): Promise<void> {
    await this.backendApi.workspacesDoRequest('deleteWorkspace', { id });
  }

  async countConnectionsByWorkspace(id: UUID): Promise<number> {
    return (await this.backendApi.workspacesDoRequest(
      'countConnectionsByWorkspace',
      { id },
    )) as number;
  }
}
