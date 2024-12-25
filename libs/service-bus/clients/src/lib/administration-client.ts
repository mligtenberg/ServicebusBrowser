import { Connection } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusAdministrationClient } from '@azure/service-bus';
import { Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';

export class AdministrationClient {
  constructor(private connection: Connection) {
  }

  async checkConnection(): Promise<boolean> {
    const administrationClient = this.getAdministrationClient();
    const queuesPages = administrationClient.listQueues();
    const queues = await queuesPages.next();

    return !!queues.value;
  }

  async getQueues(): Promise<Queue[]> {
    const administrationClient = this.getAdministrationClient();
    const queuesPages = administrationClient.listQueues();
    const queues: Queue[] = [];

    for await (const queue of queuesPages) {
      const runtimeProps = await administrationClient.getQueueRuntimeProperties(queue.name);

      queues.push({
        id: queue.name,
        name: queue.name,
        messageCount: runtimeProps.activeMessageCount,
        deadLetterMessageCount: runtimeProps.deadLetterMessageCount,
        transferDeadLetterMessageCount: runtimeProps.transferDeadLetterMessageCount,
      });
    }

    return queues;
  }

  async getTopics(): Promise<Topic[]> {
    const administrationClient = this.getAdministrationClient();
    const topicsPages = administrationClient.listTopics();
    const topics: Topic[] = [];

    for await (const topic of topicsPages) {
      topics.push({
        id: topic.name,
        name: topic.name,
      });
    }

    return topics;
  }

  async getSubscriptions(topicName: string): Promise<Subscription[]> {
    const administrationClient = this.getAdministrationClient();
    const subscriptionsPages = administrationClient.listSubscriptions(topicName);
    const subscriptions: Subscription[] = [];

    for await (const subscription of subscriptionsPages) {
      const runtimeProps = await administrationClient.getSubscriptionRuntimeProperties(topicName, subscription.subscriptionName);

      subscriptions.push({
        id: subscription.subscriptionName,
        name: subscription.subscriptionName,
        messageCount: runtimeProps.activeMessageCount,
        deadLetterMessageCount: runtimeProps.deadLetterMessageCount,
        transferDeadLetterMessageCount: runtimeProps.transferDeadLetterMessageCount,
      });
    }

    return subscriptions
  }

  private getAdministrationClient(): ServiceBusAdministrationClient {
    switch (this.connection.type) {
      case 'connectionString':
        return new ServiceBusAdministrationClient(this.connection.connectionString);
    }
  }
}
