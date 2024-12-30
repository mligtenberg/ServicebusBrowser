import { Connection } from '@service-bus-browser/service-bus-contracts';
import { RuleProperties, ServiceBusAdministrationClient } from '@azure/service-bus';
import { Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';

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

  async getQueues(): Promise<Queue[]> {
    const administrationClient = this.getAdministrationClient();
    const queuesPages = administrationClient.listQueues();
    const queues: Queue[] = [];

    for await (const queue of queuesPages) {
      const runtimeProps = await administrationClient.getQueueRuntimeProperties(queue.name);

      queues.push({
        namespaceId: this.connection.id,
        endpoint: this.getEndpoint() + queue.name,
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
        metaData: runtimeProps
      });
    }

    return subscriptions
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
