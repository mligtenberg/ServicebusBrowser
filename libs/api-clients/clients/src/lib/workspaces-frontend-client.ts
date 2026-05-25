import { Workspace } from '@service-bus-browser/shared-contracts';
import { BackendApi } from './backend-api';

export class WorkspacesFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async getActiveWorkspace(): Promise<Workspace | null> {
    return (await this.backendApi.workspacesDoRequest(
      'getActiveWorkspace',
      {},
    )) as Workspace | null;
  }
}
