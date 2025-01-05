import { Connection } from '@service-bus-browser/service-bus-contracts';
import {
  Queue,
  QueueWithMetaData, Subscription,
  SubscriptionWithMetaData,
  Topic,
  TopicWithMetaData
} from '@service-bus-browser/topology-contracts';
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

  async listQueues(connectionId: string): Promise<QueueWithMetaData[]> {
    return await serviceBusApi.doRequest('listQueues', {connectionId}) as QueueWithMetaData[];
  }

  async getQueue(connectionId: string, queueId: string): Promise<QueueWithMetaData> {
    return await serviceBusApi.doRequest('getQueue', { connectionId, queueId }) as QueueWithMetaData;
  }

  async createQueue(connectionId: string, queue: Queue): Promise<void> {
    await serviceBusApi.doRequest('addQueue', { connectionId, queue });
  }

  async editQueue(connectionId: string, queue: Queue): Promise<void> {
    await serviceBusApi.doRequest('editQueue', { connectionId, queue });
  }

  async removeQueue(connectionId: string, queueId: string): Promise<void> {
    await serviceBusApi.doRequest('removeQueue', { connectionId, queueId });
  }

  async listTopics(connectionId: string): Promise<TopicWithMetaData[]> {
    return await serviceBusApi.doRequest('listTopics', {connectionId}) as TopicWithMetaData[];
  }

  async getTopic(connectionId: string, topicId: string): Promise<TopicWithMetaData> {
    return await serviceBusApi.doRequest('getTopic', { connectionId, topicId }) as TopicWithMetaData;
  }

  async createTopic(connectionId: string, topic: Topic): Promise<void> {
    await serviceBusApi.doRequest('createTopic', { connectionId, topic });
  }

  async editTopic(connectionId: string, topic: Topic): Promise<void> {
    await serviceBusApi.doRequest('updateTopic', { connectionId, topic });
  }

  async removeTopic(connectionId: string, topicId: string): Promise<void> {
    await serviceBusApi.doRequest('deleteTopic', { connectionId, topicId });
  }

  async listSubscriptions(connectionId: string, topicId: string): Promise<SubscriptionWithMetaData[]> {
    return await serviceBusApi.doRequest('listSubscriptions', { connectionId, topicId }) as SubscriptionWithMetaData[];
  }

  async getSubscription(connectionId: string, topicId: string, subscriptionId: string): Promise<SubscriptionWithMetaData> {
    return await serviceBusApi.doRequest('getSubscription', { connectionId, topicId, subscriptionId }) as SubscriptionWithMetaData;
  }

  async createSubscription(connectionId: string, topicId: string, subscription: Subscription): Promise<void> {
    await serviceBusApi.doRequest('createSubscription', { connectionId, topicId, subscription });
  }

  async editSubscription(connectionId: string, topicId: string, subscription: Subscription): Promise<void> {
    await serviceBusApi.doRequest('updateSubscription', { connectionId, topicId, subscription });
  }

  async removeSubscription(connectionId: string, topicId: string, subscriptionId: string): Promise<void> {
    await serviceBusApi.doRequest('deleteSubscription', { connectionId, topicId, subscriptionId });
  }
}
