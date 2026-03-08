import { Connection, TopologyNode } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ApiHandler } from './api-handler';

export class ManagementFrontendClient {
  constructor(private serviceBusApi: ApiHandler) {}

  async addConnection(connection: Connection): Promise<void> {
    await this.serviceBusApi.managementDoRequest('addConnection', connection);
  }

  async removeConnection(connectionId: UUID): Promise<void> {
    await this.serviceBusApi.managementDoRequest('removeConnection', {
      connectionId,
    });
  }

  async listTopologies(): Promise<TopologyNode[]> {
    return (await this.serviceBusApi.managementDoRequest(
      'listTopologies',
      {},
    )) as TopologyNode[];
  }

  async refreshTopology(topologyPath: string): Promise<TopologyNode> {
    return (await this.serviceBusApi.managementDoRequest('refreshTopology', {
      path: topologyPath,
    })) as TopologyNode;
  }

  async listConnections(): Promise<
    Array<{ connectionId: UUID; connectionName: string }>
  > {
    return (await this.serviceBusApi.managementDoRequest(
      'listConnections',
      {},
    )) as Array<{ connectionId: UUID; connectionName: string }>;
  }

  async checkConnection(connection: Connection): Promise<boolean> {
    return (await this.serviceBusApi.managementDoRequest(
      'checkConnection',
      connection,
    )) as boolean;
  }
}
