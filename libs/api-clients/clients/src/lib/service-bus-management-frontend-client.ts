import {
  Queue,
  QueueWithMetaData,
  Subscription,
  SubscriptionRule,
  SubscriptionWithMetaData,
  Topic,
  TopicWithMetaData,
} from '@service-bus-browser/service-bus-api-contracts';
import { BackendApi } from './backend-api';

export class ServiceBusManagementFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async listQueues(connectionId: string): Promise<QueueWithMetaData[]> {
    return (await this.backendApi.serviceBusManagementDoRequest(
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
    return (await this.backendApi.serviceBusManagementDoRequest('getQueue', {
      connectionId,
      queueId,
    })) as QueueWithMetaData;
  }

  async createQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('addQueue', {
      connectionId,
      queue,
    });
  }

  async editQueue(connectionId: string, queue: Queue): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('editQueue', {
      connectionId,
      queue,
    });
  }

  async removeQueue(connectionId: string, queueId: string): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('removeQueue', {
      connectionId,
      queueId,
    });
  }

  async listTopics(connectionId: string): Promise<TopicWithMetaData[]> {
    return (await this.backendApi.serviceBusManagementDoRequest(
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
    return (await this.backendApi.serviceBusManagementDoRequest('getTopic', {
      connectionId,
      topicId,
    })) as TopicWithMetaData;
  }

  async createTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('createTopic', {
      connectionId,
      topic,
    });
  }

  async editTopic(connectionId: string, topic: Topic): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('updateTopic', {
      connectionId,
      topic,
    });
  }

  async removeTopic(connectionId: string, topicId: string): Promise<void> {
    await this.backendApi.serviceBusManagementDoRequest('deleteTopic', {
      connectionId,
      topicId,
    });
  }

  async listSubscriptions(
    connectionId: string,
    topicId: string,
  ): Promise<SubscriptionWithMetaData[]> {
    return (await this.backendApi.serviceBusManagementDoRequest(
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
    return (await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
    await this.backendApi.serviceBusManagementDoRequest(
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
