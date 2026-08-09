import { Connection, TopologyNode } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { BackendApi } from './backend-api';

export class ManagementFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async addConnection(connection: Connection): Promise<void> {
    await this.backendApi.managementDoRequest('addConnection', connection);
  }

  async renameConnection(connectionId: UUID, name: string, workspaceId?: UUID): Promise<void> {
    await this.backendApi.managementDoRequest('renameConnection', {
      connectionId,
      name,
      workspaceId,
    });
  }

  async removeConnection(connectionId: UUID, workspaceId?: UUID): Promise<void> {
    await this.backendApi.managementDoRequest('removeConnection', {
      connectionId,
      workspaceId,
    });
  }

  async listTopologies(workspaceId: UUID): Promise<TopologyNode[]> {
    return (await this.backendApi.managementDoRequest(
      'listTopologies',
      { workspaceId },
    )) as TopologyNode[];
  }

  async refreshTopology(topologyPath: string, workspaceId: UUID): Promise<TopologyNode> {
    return (await this.backendApi.managementDoRequest('refreshTopology', {
      path: topologyPath,
      workspaceId,
    })) as TopologyNode;
  }

  async listConnections(workspaceId: UUID): Promise<
    Array<{ connectionId: UUID; connectionName: string }>
  > {
    return (await this.backendApi.managementDoRequest(
      'listConnections',
      { workspaceId },
    )) as Array<{ connectionId: UUID; connectionName: string }>;
  }

  async checkConnection(connection: Connection): Promise<boolean> {
    return (await this.backendApi.managementDoRequest(
      'checkConnection',
      connection,
    )) as boolean;
  }
}
