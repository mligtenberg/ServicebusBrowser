import { Connection } from '@service-bus-browser/service-bus-contracts';
import { Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

interface ElectronWindow {
  serviceBusApi: {
    doRequest: (requestType: string, request: unknown) => Promise<unknown>;
  };
}

const typelessWindow = window as unknown;
const { serviceBusApi } = typelessWindow as ElectronWindow;

export class ServiceBusElectronClient {
  async addConnection(connection: Connection): Promise<void> {
    await serviceBusApi.doRequest('addConnection', connection);
  }

  async removeConnection(connectionId: UUID): Promise<void> {
    await serviceBusApi.doRequest('removeConnection', { connectionId });
  }

  async listConnections(): Promise<Array<{ connectionId: UUID, connectionName: string }>> {
    return await serviceBusApi.doRequest('listConnections', {}) as Array<{ connectionId: UUID, connectionName: string }>;
  }

  async checkConnection(connection: Connection): Promise<boolean> {
    return await serviceBusApi.doRequest('checkConnection', connection) as boolean;
  }

  async listQueues(connectionId: string): Promise<Queue[]> {
    return await serviceBusApi.doRequest('listQueues', {connectionId}) as Queue[];
  }

  async listTopics(connectionId: string): Promise<Topic[]> {
    return await serviceBusApi.doRequest('listTopics', {connectionId}) as Topic[];
  }

  async listSubscriptions(connectionId: string, topicId: string): Promise<Subscription[]> {
    return await serviceBusApi.doRequest('listSubscriptions', { connectionId, topicId }) as Subscription[];
  }
}
