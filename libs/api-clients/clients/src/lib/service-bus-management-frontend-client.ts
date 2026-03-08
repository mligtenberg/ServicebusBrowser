import { Connection, TopologyNode } from '@service-bus-browser/api-contracts';
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
import { ApiHandler } from './api-handler';

export class ServiceBusManagementFrontendClient {
  constructor(private serviceBusApi: ApiHandler) {}

  async listQueues(connectionId: string): Promise<QueueWithMetaData[]> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest(
      'listQueues',
      {
        connectionId,
      },
    )) as QueueWithMetaData[];
  }

  async getQueue(
    connectionId: string,
    queueId: string,
  ): Promise<QueueWithMetaData> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest('getQueue', {
      connectionId,
      queueId,
    })) as QueueWithMetaData;
  }

  async createQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('addQueue', {
      connectionId,
      queue,
    });
  }

  async editQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('editQueue', {
      connectionId,
      queue,
    });
  }

  async removeQueue(connectionId: string, queueId: string): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('removeQueue', {
      connectionId,
      queueId,
    });
  }

  async listTopics(connectionId: string): Promise<TopicWithMetaData[]> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest(
      'listTopics',
      {
        connectionId,
      },
    )) as TopicWithMetaData[];
  }

  async getTopic(
    connectionId: string,
    topicId: string,
  ): Promise<TopicWithMetaData> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest('getTopic', {
      connectionId,
      topicId,
    })) as TopicWithMetaData;
  }

  async createTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('createTopic', {
      connectionId,
      topic,
    });
  }

  async editTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('updateTopic', {
      connectionId,
      topic,
    });
  }

  async removeTopic(connectionId: string, topicId: string): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest('deleteTopic', {
      connectionId,
      topicId,
    });
  }

  async listSubscriptions(
    connectionId: string,
    topicId: string,
  ): Promise<SubscriptionWithMetaData[]> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest(
      'listSubscriptions',
      {
        connectionId,
        topicId,
      },
    )) as SubscriptionWithMetaData[];
  }

  async getSubscription(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
  ): Promise<SubscriptionWithMetaData> {
    return (await this.serviceBusApi.serviceBusManagementDoRequest(
      'getSubscription',
      {
        connectionId,
        topicId,
        subscriptionId,
      },
    )) as SubscriptionWithMetaData;
  }

  async createSubscription(
    connectionId: string,
    topicId: string,
    subscription: Subscription,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'createSubscription',
      {
        connectionId,
        topicId,
        subscription,
      },
    );
  }

  async editSubscription(
    connectionId: string,
    topicId: string,
    subscription: Subscription,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'updateSubscription',
      {
        connectionId,
        topicId,
        subscription,
      },
    );
  }

  async removeSubscription(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'deleteSubscription',
      {
        connectionId,
        topicId,
        subscriptionId,
      },
    );
  }

  async createSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    rule: SubscriptionRule,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'addSubscriptionRule',
      {
        connectionId,
        topicId,
        subscriptionId,
        rule,
      },
    );
  }

  async editSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    rule: SubscriptionRule,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'editSubscriptionRule',
      {
        connectionId,
        topicId,
        subscriptionId,
        rule,
      },
    );
  }

  async removeSubscriptionRule(
    connectionId: string,
    topicId: string,
    subscriptionId: string,
    ruleName: string,
  ): Promise<void> {
    await this.serviceBusApi.serviceBusManagementDoRequest(
      'removeSubscriptionRule',
      {
        connectionId,
        topicId,
        subscriptionId,
        ruleName,
      },
    );
  }
}
