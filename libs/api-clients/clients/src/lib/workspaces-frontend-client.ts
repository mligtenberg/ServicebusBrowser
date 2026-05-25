import { Workspace } from '@service-bus-browser/shared-contracts';
import { BackendApi } from './backend-api';

export class WorkspacesFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async listWorkspaces(): Promise<Workspace[]> {
    return (await this.backendApi.workspacesDoRequest(
      'listWorkspaces',
      {},
    )) as Workspace[];
  }
}
