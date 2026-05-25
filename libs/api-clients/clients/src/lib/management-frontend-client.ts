import { Connection, TopologyNode } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { BackendApi } from './backend-api';

export class ManagementFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async addConnection(connection: Connection): Promise<void> {
    await this.backendApi.managementDoRequest('addConnection', connection);
  }

  async removeConnection(connectionId: UUID): Promise<void> {
    await this.backendApi.managementDoRequest('removeConnection', {
      connectionId,
    });
  }

  async listTopologies(): Promise<TopologyNode[]> {
    return (await this.backendApi.managementDoRequest(
      'listTopologies',
      {},
    )) as TopologyNode[];
  }

  async refreshTopology(topologyPath: string): Promise<TopologyNode> {
    return (await this.backendApi.managementDoRequest('refreshTopology', {
      path: topologyPath,
    })) as TopologyNode;
  }

  async listConnections(): Promise<
    Array<{ connectionId: UUID; connectionName: string }>
  > {
    return (await this.backendApi.managementDoRequest(
      'listConnections',
      {},
    )) as Array<{ connectionId: UUID; connectionName: string }>;
  }

  async checkConnection(connection: Connection): Promise<boolean> {
    return (await this.backendApi.managementDoRequest(
      'checkConnection',
      connection,
    )) as boolean;
  }
}
