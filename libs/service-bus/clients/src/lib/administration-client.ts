import { Connection } from '@service-bus-browser/service-bus-contracts';
import {
  CorrelationRuleFilter, CreateSubscriptionOptions, QueueProperties, QueueRuntimeProperties,
  RuleProperties,
  ServiceBusAdministrationClient,
  SubscriptionProperties, SubscriptionRuntimeProperties, TopicProperties, TopicRuntimeProperties
} from '@azure/service-bus';
import {
  QueueWithMetaData,
  SubscriptionWithMetaData,
  SubscriptionRule,
  TopicWithMetaData, Topic, Subscription
} from '@service-bus-browser/topology-contracts';

export class AdministrationClient {
  constructor(private connection: Connection) {
  }

  async checkConnection(): Promise<boolean> {
   try {
     const administrationClient = this.getAdministrationClient();
     const queuesPages = administrationClient.listQueues();
     const queues = await queuesPages.next();

     return !!queues.value;
   }
    catch {
      return false;
    }
  }

  async getQueues(): Promise<QueueWithMetaData[]> {
    const administrationClient = this.getAdministrationClient();
    const queuesPages = administrationClient.listQueues();
    const queues: QueueWithMetaData[] = [];

    for await (const queue of queuesPages) {
      const runtimeProps = await administrationClient.getQueueRuntimeProperties(queue.name);

      queues.push(this.mapQueue(queue, runtimeProps));
    }

    return queues;
  }

  async getQueue(queueId: string): Promise<QueueWithMetaData> {
    const administrationClient = this.getAdministrationClient();
    const [queue, queueMeta] = await Promise.all([
      administrationClient.getQueue(queueId),
      administrationClient.getQueueRuntimeProperties(queueId)
    ]);

    return this.mapQueue(queue, queueMeta);
  }

  async addQueue(queue: QueueWithMetaData): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const body = {
      autoDeleteOnIdle: !queue.properties.autoDeleteOnIdle ? undefined : queue.properties.autoDeleteOnIdle,
      defaultMessageTimeToLive: queue.properties.defaultMessageTimeToLive,
      duplicateDetectionHistoryTimeWindow: !queue.properties.duplicateDetectionHistoryTimeWindow ? undefined : queue.properties.duplicateDetectionHistoryTimeWindow,
      forwardDeadLetteredMessagesTo: queue.properties.forwardDeadLetteredMessagesTo ?? undefined,
      forwardTo: queue.properties.forwardMessagesTo ?? undefined,
      lockDuration: !queue.properties.lockDuration ? undefined : queue.properties.lockDuration,
      userMetadata: !queue.properties.userMetadata ? undefined : queue.properties.userMetadata,
      enableExpress: queue.settings.enableExpress,
      enablePartitioning: queue.settings.enablePartitioning,
      requiresSession: queue.settings.requiresSession,
      requiresDuplicateDetection: queue.settings.requiresDuplicateDetection,
      enableBatchedOperations: queue.settings.enableBatchedOperations,
      deadLetteringOnMessageExpiration: queue.settings.deadLetteringOnMessageExpiration,
      maxSizeInMegabytes: queue.properties.maxSizeInMegabytes,
      maxDeliveryCount: queue.properties.maxDeliveryCount
    };

    await administrationClient.createQueue(queue.name, body);
  }

  async updateQueue(queue: QueueWithMetaData): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const queueProperties = await administrationClient.getQueue(queue.name);

    queueProperties.autoDeleteOnIdle = !queue.properties.autoDeleteOnIdle ? queueProperties.autoDeleteOnIdle : queue.properties.autoDeleteOnIdle;
    queueProperties.defaultMessageTimeToLive = queue.properties.defaultMessageTimeToLive;
    queueProperties.duplicateDetectionHistoryTimeWindow = !queue.properties.duplicateDetectionHistoryTimeWindow ? queueProperties.duplicateDetectionHistoryTimeWindow : queue.properties.duplicateDetectionHistoryTimeWindow;
    queueProperties.forwardDeadLetteredMessagesTo = queue.properties.forwardDeadLetteredMessagesTo ?? undefined;
    queueProperties.forwardTo = queue.properties.forwardMessagesTo ?? undefined;
    queueProperties.lockDuration = !queue.properties.lockDuration ? queueProperties.lockDuration : queue.properties.lockDuration;
    queueProperties.userMetadata = !queue.properties.userMetadata ? '' : queue.properties.userMetadata;
    queueProperties.enableBatchedOperations = queue.settings.enableBatchedOperations;
    queueProperties.deadLetteringOnMessageExpiration = queue.settings.deadLetteringOnMessageExpiration;
    queueProperties.maxSizeInMegabytes = queue.properties.maxSizeInMegabytes;
    queueProperties.maxDeliveryCount = queue.properties.maxDeliveryCount;

    await administrationClient.updateQueue(queueProperties);
  }

  async deleteQueue(queueId: string): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    await administrationClient.deleteQueue(queueId);
  }

  async getTopics(): Promise<TopicWithMetaData[]> {
    const administrationClient = this.getAdministrationClient();
    const topicsPages = administrationClient.listTopics();
    const topics: TopicWithMetaData[] = [];

    for await (const topic of topicsPages) {
      const topicMeta = await administrationClient.getTopicRuntimeProperties(topic.name);

      topics.push(this.mapTopic(topic, topicMeta));
    }

    return topics;
  }

  async getTopic(topicId: string): Promise<TopicWithMetaData> {
    const administrationClient = this.getAdministrationClient();
    const [topic, topicMeta] = await Promise.all([
      administrationClient.getTopic(topicId),
      administrationClient.getTopicRuntimeProperties(topicId)
    ]);

    return this.mapTopic(topic, topicMeta);
  }

  async addTopic(topic: Topic): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const body = {
      autoDeleteOnIdle: !topic.properties.autoDeleteOnIdle ? undefined : topic.properties.autoDeleteOnIdle,
      defaultMessageTimeToLive: topic.properties.defaultMessageTimeToLive,
      duplicateDetectionHistoryTimeWindow: !topic.properties.duplicateDetectionHistoryTimeWindow ? undefined : topic.properties.duplicateDetectionHistoryTimeWindow,
      maxSizeInMegabytes: topic.properties.maxSizeInMegabytes,
      userMetadata: !topic.properties.userMetadata ? undefined : topic.properties.userMetadata,
      enableBatchedOperations: topic.settings.enableBatchedOperations,
      enableExpress: topic.settings.enableExpress,
      enablePartitioning: topic.settings.enablePartitioning,
      requiresDuplicateDetection: topic.settings.requiresDuplicateDetection,
      supportOrdering: topic.settings.supportOrdering
    };

    await administrationClient.createTopic(topic.name, body);
  }

  async updateTopic(topic: Topic): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const topicProperties = await administrationClient.getTopic(topic.name);

    topicProperties.autoDeleteOnIdle = !topic.properties.autoDeleteOnIdle ? topicProperties.autoDeleteOnIdle : topic.properties.autoDeleteOnIdle;
    topicProperties.defaultMessageTimeToLive = topic.properties.defaultMessageTimeToLive;
    topicProperties.duplicateDetectionHistoryTimeWindow = !topic.properties.duplicateDetectionHistoryTimeWindow ? topicProperties.duplicateDetectionHistoryTimeWindow : topic.properties.duplicateDetectionHistoryTimeWindow;
    topicProperties.maxSizeInMegabytes = topic.properties.maxSizeInMegabytes;
    topicProperties.userMetadata = !topic.properties.userMetadata ? '' : topic.properties.userMetadata;
    topicProperties.enableBatchedOperations = topic.settings.enableBatchedOperations;
    topicProperties.supportOrdering = topic.settings.supportOrdering;

    await administrationClient.updateTopic(topicProperties);
  }

  async deleteTopic(topicId: string): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    await administrationClient.deleteTopic(topicId);
  }

  async getSubscriptions(topicId: string): Promise<SubscriptionWithMetaData[]> {
    const administrationClient = this.getAdministrationClient();
    const subscriptionsPages = administrationClient.listSubscriptions(topicId);
    const subscriptions: SubscriptionWithMetaData[] = [];

    for await (const subscription of subscriptionsPages) {
      const [subscriptionMeta, rules] = await Promise.all([
        administrationClient.getSubscriptionRuntimeProperties(topicId, subscription.subscriptionName),
        this.getSubscriptionRules(administrationClient, topicId, subscription.subscriptionName)
      ]);

      subscriptions.push(this.mapSubscription(topicId, subscription, subscriptionMeta, rules));
    }

    return subscriptions
  }

  async getSubscription(topicId: string, subscriptionId: string) {
    const administrationClient = this.getAdministrationClient();
    const [subscription, subscriptionMeta, rules] = await Promise.all([
      administrationClient.getSubscription(topicId, subscriptionId),
      administrationClient.getSubscriptionRuntimeProperties(topicId, subscriptionId),
      this.getSubscriptionRules(administrationClient, topicId, subscriptionId)
    ]);

    return this.mapSubscription(topicId, subscription, subscriptionMeta, rules);
  }

  async addSubscription(topicId: string, subscription: Subscription): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const body: CreateSubscriptionOptions = {
      autoDeleteOnIdle: !subscription.properties.autoDeleteOnIdle ? undefined : subscription.properties.autoDeleteOnIdle,
      defaultMessageTimeToLive: subscription.properties.defaultMessageTimeToLive,
      forwardDeadLetteredMessagesTo: subscription.properties.forwardDeadLetteredMessagesTo ?? undefined,
      forwardTo: subscription.properties.forwardMessagesTo ?? undefined,
      lockDuration: !subscription.properties.lockDuration ? undefined : subscription.properties.lockDuration,
      userMetadata: !subscription.properties.userMetadata ? undefined : subscription.properties.userMetadata,
      enableBatchedOperations: subscription.settings.enableBatchedOperations,
      requiresSession: subscription.settings.requiresSession,
      maxDeliveryCount: subscription.properties.maxDeliveryCount,
      deadLetteringOnFilterEvaluationExceptions: subscription.settings.deadLetteringOnFilterEvaluationExceptions,
      deadLetteringOnMessageExpiration: subscription.settings.deadLetteringOnMessageExpiration,
      defaultRuleOptions: {
        name: '$Default',
        filter: {
          sqlExpression: '1=1'
        },
      },
    };

    await administrationClient.createSubscription(topicId, subscription.name, body);
  }

  async updateSubscription(topicId: string, subscription: Subscription): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    const subscriptionProperties = await administrationClient.getSubscription(topicId, subscription.name);

    subscriptionProperties.autoDeleteOnIdle = !subscription.properties.autoDeleteOnIdle ? subscriptionProperties.autoDeleteOnIdle : subscription.properties.autoDeleteOnIdle;
    subscriptionProperties.defaultMessageTimeToLive = subscription.properties.defaultMessageTimeToLive;
    subscriptionProperties.forwardDeadLetteredMessagesTo = subscription.properties.forwardDeadLetteredMessagesTo ?? undefined;
    subscriptionProperties.forwardTo = subscription.properties.forwardMessagesTo ?? undefined;
    subscriptionProperties.lockDuration = !subscription.properties.lockDuration ? subscriptionProperties.lockDuration : subscription.properties.lockDuration;
    subscriptionProperties.userMetadata = !subscription.properties.userMetadata ? '' : subscription.properties.userMetadata;
    subscriptionProperties.enableBatchedOperations = subscription.settings.enableBatchedOperations;
    subscriptionProperties.maxDeliveryCount = subscription.properties.maxDeliveryCount;
    subscriptionProperties.deadLetteringOnFilterEvaluationExceptions = subscription.settings.deadLetteringOnFilterEvaluationExceptions;
    subscriptionProperties.deadLetteringOnMessageExpiration = subscription.settings.deadLetteringOnMessageExpiration;

    await administrationClient.updateSubscription(subscriptionProperties);
  }

  async deleteSubscription(topicId: string, subscriptionId: string): Promise<void> {
    const administrationClient = this.getAdministrationClient();
    await administrationClient.deleteSubscription(topicId, subscriptionId);
  }

  private async getSubscriptionRules(client: ServiceBusAdministrationClient, topicName: string, subscriptionName: string)
    : Promise<RuleProperties[]> {
    let finished = false;
    const rules: RuleProperties[] = [];

    const iterator = client.listRules(topicName, subscriptionName);
    do {
      const result = await iterator.next();
      if (result.value) {
        rules.push(result.value);
      }
      finished = result.done ?? true;
    } while (!finished);
    return rules;
  }

  private getAdministrationClient(): ServiceBusAdministrationClient {
    switch (this.connection.type) {
      case 'connectionString':
        return new ServiceBusAdministrationClient(this.connection.connectionString);
    }
  }

  private getEndpoint(): string {
    switch (this.connection.type) {
      case 'connectionString':
        {
          const endpoint = this.connection.connectionString.split(';').find((part) => part.startsWith('Endpoint='))?.split('=')[1] ?? '/';
          return endpoint[endpoint.length - 1] === '/' ? endpoint : `${endpoint}/`;
        }
    }
  }

  private mapQueue(queue: QueueProperties, queueMeta: QueueRuntimeProperties): QueueWithMetaData {
    return {
      namespaceId: this.connection.id,
      id: queue.name,
      name: queue.name,
      metadata: {
        ...queueMeta,
        endpoint: this.getEndpoint() + queue.name,
    },
      settings: {
        deadLetteringOnMessageExpiration: queue.deadLetteringOnMessageExpiration,
          enableExpress: queue.enableExpress,
          enablePartitioning: queue.enablePartitioning,
          requiresSession: queue.requiresSession,
          requiresDuplicateDetection: queue.requiresDuplicateDetection,
          enableBatchedOperations: queue.enableBatchedOperations,
      },
      properties: {
        autoDeleteOnIdle: queue.autoDeleteOnIdle,
          defaultMessageTimeToLive: queue.defaultMessageTimeToLive,
          duplicateDetectionHistoryTimeWindow: queue.duplicateDetectionHistoryTimeWindow,
          forwardDeadLetteredMessagesTo: queue.forwardDeadLetteredMessagesTo ?? null,
          forwardMessagesTo: queue.forwardTo ?? null,
          lockDuration: queue.lockDuration,
          maxDeliveryCount: queue.maxDeliveryCount,
          maxSizeInMegabytes: queue.maxSizeInMegabytes,
          userMetadata: queue.userMetadata ?? null,
      }
    }
  }

  private mapTopic(topic: TopicProperties, topicMeta: TopicRuntimeProperties): TopicWithMetaData {
    return {
      namespaceId: this.connection.id,
      id: topic.name,
      name: topic.name,
      properties: {
        autoDeleteOnIdle: topic.autoDeleteOnIdle,
        defaultMessageTimeToLive: topic.defaultMessageTimeToLive,
        duplicateDetectionHistoryTimeWindow: topic.duplicateDetectionHistoryTimeWindow,
        maxSizeInMegabytes: topic.maxSizeInMegabytes,
        userMetadata: topic.userMetadata ?? null,
      },
      settings: {
        enableBatchedOperations: topic.enableBatchedOperations,
        enableExpress: topic.enableExpress,
        enablePartitioning: topic.enablePartitioning,
        requiresDuplicateDetection: topic.requiresDuplicateDetection,
        supportOrdering: topic.supportOrdering,
      },
      metadata: {
        ...topicMeta,
        endpoint: this.getEndpoint() + topic.name,
      }
    };
  }

  private mapSubscription(
    topicId: string,
    subscription: SubscriptionProperties,
    subscriptionMeta: SubscriptionRuntimeProperties,
    rules: RuleProperties[]
  ): SubscriptionWithMetaData {
    return {
      namespaceId: this.connection.id,
      topicId: topicId,
      id: subscription.subscriptionName,
      name: subscription.subscriptionName,
      properties: {
        maxDeliveryCount: subscription.maxDeliveryCount,
        autoDeleteOnIdle: subscription.autoDeleteOnIdle,
        defaultMessageTimeToLive: subscription.defaultMessageTimeToLive,
        forwardDeadLetteredMessagesTo: subscription.forwardDeadLetteredMessagesTo ?? null,
        forwardMessagesTo: subscription.forwardTo ?? null,
        lockDuration: subscription.lockDuration,
        userMetadata: subscription.userMetadata ?? null,
      },
      settings: {
        deadLetteringOnFilterEvaluationExceptions: subscription.deadLetteringOnFilterEvaluationExceptions,
        deadLetteringOnMessageExpiration: subscription.deadLetteringOnMessageExpiration,
        enableBatchedOperations: subscription.enableBatchedOperations,
        requiresSession: subscription.requiresSession,
      },
      metaData: {
        ...subscriptionMeta,
        endpoint: this.getEndpoint() + topicId + '/' + subscription.subscriptionName,
      },
      rules: rules.map((rule) => {
        return ('sqlExpression' in rule.filter ? {
          filterType: 'sql',
          filter: rule.filter.sqlExpression,
          action: rule.action.sqlExpression
        } : {
          filterType: 'correlation',
          systemProperties: Object.keys(rule.filter).map((key) => {
            const filter = rule.filter as CorrelationRuleFilter;
            // @ts-expect-error - TS doesn't know that the key is a valid key
            const value = filter[key] as unknown;
            if (typeof value !== 'string') {
              return null;
            }

            return {
              key: key,
              value: value
            }
          }).filter((value) => value !== null),
          applicationProperties: rule.filter.applicationProperties
        }) as SubscriptionRule;
      })
    };
  }
}
