import { Connection } from '@service-bus-browser/service-bus-contracts';
import {
  Queue,
  QueueWithMetaData,
  Subscription,
  SubscriptionRule,
  SubscriptionWithMetaData,
  Topic,
  TopicWithMetaData,
} from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusApiHandler } from './service-bus-api-handler';

export class ServiceBusManagementFrontendClient {
  constructor(private serviceBusApi: ServiceBusApiHandler) {}

  async addConnection(connection: Connection): Promise<void> {
    await this.serviceBusApi.managementDoRequest('addConnection', connection);
  }

  async removeConnection(connectionId: UUID): Promise<void> {
    await this.serviceBusApi.managementDoRequest('removeConnection', {
      connectionId,
    });
  }

  async listConnections(): Promise<
    Array<{ connectionId: UUID; connectionName: string }>
  > {
    return (await this.serviceBusApi.managementDoRequest(
      'listConnections',
      {}
    )) as Array<{ connectionId: UUID; connectionName: string }>;
  }

  async checkConnection(connection: Connection): Promise<boolean> {
    return (await this.serviceBusApi.managementDoRequest(
      'checkConnection',
      connection
    )) as boolean;
  }

  async listQueues(connectionId: string): Promise<QueueWithMetaData[]> {
    return (await this.serviceBusApi.managementDoRequest('listQueues', {
      connectionId,
    })) as QueueWithMetaData[];
  }

  async getQueue(
    connectionId: string,
    queueId: string
  ): Promise<QueueWithMetaData> {
    return (await this.serviceBusApi.managementDoRequest('getQueue', {
      connectionId,
      queueId,
    })) as QueueWithMetaData;
  }

  async createQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.serviceBusApi.managementDoRequest('addQueue', {
      connectionId,
      queue,
    });
  }

  async editQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.serviceBusApi.managementDoRequest('editQueue', {
      connectionId,
      queue,
    });
  }

  async removeQueue(connectionId: string, queueId: string): Promise<void> {
    await this.serviceBusApi.managementDoRequest('removeQueue', {
      connectionId,
      queueId,
    });
  }

  async listTopics(connectionId: string): Promise<TopicWithMetaData[]> {
    return (await this.serviceBusApi.managementDoRequest('listTopics', {
      connectionId,
    })) as TopicWithMetaData[];
  }

  async getTopic(
    connectionId: string,
    topicId: string
  ): Promise<TopicWithMetaData> {
    return (await this.serviceBusApi.managementDoRequest('getTopic', {
      connectionId,
      topicId,
    })) as TopicWithMetaData;
  }

  async createTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.serviceBusApi.managementDoRequest('createTopic', {
      connectionId,
      topic,
    });
  }

  async editTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.serviceBusApi.managementDoRequest('updateTopic', {
      connectionId,
      topic,
    });
  }

  async removeTopic(connectionId: string, topicId: string): Promise<void> {
    await this.serviceBusApi.managementDoRequest('deleteTopic', {
      connectionId,
      topicId,
    });
  }

  async listSubscriptions(
    connectionId: string,
    topicId: string
  ): Promise<SubscriptionWithMetaData[]> {
    return (await this.serviceBusApi.managementDoRequest('listSubscriptions', {
      connectionId,
      topicId,
    })) as SubscriptionWithMetaData[];
  }

  async getSubscription(
    connectionId: string,
    topicId: string,
    subscriptionId: string
  ): Promise<SubscriptionWithMetaData> {
    return (await this.serviceBusApi.managementDoRequest('getSubscription', {
      connectionId,
      topicId,
      subscriptionId,
    })) as SubscriptionWithMetaData;
  }

  async createSubscription(
    connectionId: string,
    topicId: string,
    subscription: Subscription
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('createSubscription', {
      connectionId,
      topicId,
      subscription,
    });
  }

  async editSubscription(
    connectionId: string,
    topicId: string,
    subscription: Subscription
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('updateSubscription', {
      connectionId,
      topicId,
      subscription,
    });
  }

  async removeSubscription(
    connectionId: string,
    topicId: string,
    subscriptionId: string
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('deleteSubscription', {
      connectionId,
      topicId,
      subscriptionId,
    });
  }

  async createSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    rule: SubscriptionRule
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('addSubscriptionRule', {
      connectionId,
      topicId,
      subscriptionId,
      rule,
    });
  }

  async editSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    rule: SubscriptionRule
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('editSubscriptionRule', {
      connectionId,
      topicId,
      subscriptionId,
      rule,
    });
  }

  async removeSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    ruleName: string
  ): Promise<void> {
    await this.serviceBusApi.managementDoRequest('removeSubscriptionRule', {
      connectionId,
      topicId,
      subscriptionId,
      ruleName,
    });
  }
}
