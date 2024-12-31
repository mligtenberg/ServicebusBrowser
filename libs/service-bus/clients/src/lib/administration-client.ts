import { Connection } from '@service-bus-browser/service-bus-contracts';
import { CorrelationRuleFilter, RuleProperties, ServiceBusAdministrationClient } from '@azure/service-bus';
import { QueueWithMetaData, Subscription, SubscriptionRule, Topic } from '@service-bus-browser/topology-contracts';

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

      queues.push({
        namespaceId: this.connection.id,
        id: queue.name,
        name: queue.name,
        metadata: {
          accessedAt: runtimeProps.accessedAt,
          activeMessageCount: runtimeProps.activeMessageCount,
          createdAt: runtimeProps.createdAt,
          modifiedAt: runtimeProps.modifiedAt,
          scheduledMessageCount: runtimeProps.scheduledMessageCount,
          sizeInBytes: runtimeProps.sizeInBytes,
          totalMessageCount: runtimeProps.totalMessageCount,
          deadLetterMessageCount: runtimeProps.deadLetterMessageCount,
          transferDeadLetterMessageCount: runtimeProps.transferDeadLetterMessageCount,
          transferMessageCount: runtimeProps.transferMessageCount,
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
      });
    }

    return queues;
  }

  async getTopics(): Promise<Topic[]> {
    const administrationClient = this.getAdministrationClient();
    const topicsPages = administrationClient.listTopics();
    const topics: Topic[] = [];

    for await (const topic of topicsPages) {
      const topicMeta = await administrationClient.getTopicRuntimeProperties(topic.name);

      topics.push({
        namespaceId: this.connection.id,
        endpoint: this.getEndpoint() + topic.name,
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
        metadata: topicMeta
      });
    }

    return topics;
  }

  async getSubscriptions(topicId: string): Promise<Subscription[]> {
    const administrationClient = this.getAdministrationClient();
    const subscriptionsPages = administrationClient.listSubscriptions(topicId);
    const subscriptions: Subscription[] = [];

    for await (const subscription of subscriptionsPages) {
      const runtimeProps = await administrationClient.getSubscriptionRuntimeProperties(topicId, subscription.subscriptionName);
      const rules = await this.getSubscriptionRules(administrationClient, topicId, subscription.subscriptionName);

      subscriptions.push({
        namespaceId: this.connection.id,
        topicId: topicId,
        id: subscription.subscriptionName,
        endpoint: this.getEndpoint() + topicId + '/' + subscription.subscriptionName,
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
        metaData: runtimeProps,
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
      });
    }

    return subscriptions
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

    console.log('Creating queue', queue.name, body);

    await administrationClient.createQueue(queue.name, body);
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
}
