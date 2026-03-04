import {
  Connection,
  MessageQueueTargetType,
  TopologyNode,
  TopologyProvider,
} from '@service-bus-browser/message-queue-contracts';
import { AdministrationClient } from './internal/administration-client';
import {
  faCheckToSlot,
  faFolder as faFolderSolid,
  faFolderTree,
  faServer,
} from '@fortawesome/free-solid-svg-icons';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import {
  QueueWithMetaData,
  SubscriptionWithMetaData,
  TopicWithMetaData,
} from '@service-bus-browser/topology-contracts';

export class ServiceBusTopologyProvider implements TopologyProvider {
  target: MessageQueueTargetType = 'serviceBus';
  private administrationClient;

  constructor(private connection: Connection) {
    this.administrationClient = new AdministrationClient(this.connection);
  }

  async getTopology(): Promise<TopologyNode> {
    const [queues, topics] = await Promise.all([
      this.loadQueues(),
      this.loadTopics(),
    ]);

    return {
      path: `/${this.connection.id}`,
      name: this.connection.name,
      icon: faServer,
      refreshable: true,
      actions: [
        {
          icon: 'pi pi-plus',
          displayName: 'Add queue',
          actionType: 'add-queue',
          parameters: {
            connectionId: this.connection.id,
          },
        },
        {
          icon: 'pi pi-plus',
          displayName: 'Add topic',
          actionType: 'add-topic',
          parameters: {
            connectionId: this.connection.id,
          },
        },
      ],
      children: [
        {
          path: `/${this.connection.id}/queues`,
          name: 'Queues',
          refreshable: true,
          children: queues,
          actions: [
            {
              icon: 'pi pi-plus',
              displayName: 'Add queue',
              actionType: 'add-queue',
              parameters: {
                connectionId: this.connection.id,
              },
            },
          ],
        },
        {
          path: `/${this.connection.id}/topics`,
          name: 'Topics',
          refreshable: true,
          children: topics,
          actions: [
            {
              icon: 'pi pi-plus',
              displayName: 'Add topic',
              actionType: 'add-topic',
              parameters: {
                connectionId: this.connection.id,
              },
            },
          ],
        },
      ],
    };
  }

  refreshTopology(refreshFromPath: string): Promise<TopologyNode> {
    if (refreshFromPath === "/") {
      return this.getTopology();
    }

    const segments = refreshFromPath.split('/');
    if (!segments[2]) {
      return this.getTopology();
    }

    if (segments[2] === 'queues') {
      return this.refreshQueues(segments);
    }
    if (segments[2] === 'topics') {
      return this.refreshTopics(segments);
    }

    throw new Error('Invalid path');
  }

  private async refreshQueues(segements: string[]): Promise<TopologyNode> {
    const queueName = segements[3];
    if (!queueName) {
      return {
        path: `/${this.connection.id}/queues`,
        name: 'Queues',
        refreshable: true,
        children: await this.loadQueues(),
      }
    }

    const queue = await this.administrationClient.getQueue(queueName);
    return this.mapQueue(queue);
  }

  private async refreshTopics(segements: string[]): Promise<TopologyNode> {
    const topicName = segements[3];
    if (!topicName) {
      return {
        path: `/${this.connection.id}/topics`,
        name: 'Topics',
        refreshable: true,
        children: await this.loadTopics(),
      }
    }

    const subscriptionName = segements[4];
    if (!subscriptionName) {
      const topic = await this.administrationClient.getTopic(topicName);
      const subscriptions = await this.loadSubscriptions(topicName);
      return this.mapTopic(topic, subscriptions);
    }

    const subscription = await this.administrationClient.getSubscription(
      topicName,
      subscriptionName,
    );
    return this.mapSubscription(subscription, topicName);
  }

  private async loadQueues() {
    const queues = await this.administrationClient.getQueues();
    return queues.map((queue): TopologyNode => this.mapQueue(queue));
  }

  private async loadTopics() {
    const topics = await this.administrationClient.getTopics();
    const subscriptions = await Promise.all(
      topics.map((topic) =>
        this.loadSubscriptions(topic.name),
      ),
    );

    return topics.map(
      (topic, index): TopologyNode =>
        this.mapTopic(topic, subscriptions[index]),
    );
  }

  private async loadSubscriptions(topicName: string) {
    const subscriptions = await this.administrationClient.getSubscriptions(
      topicName,
    );
    return subscriptions.map((subscription): TopologyNode =>
      this.mapSubscription(subscription, topicName),
    );
  }

  private mapQueue(queue: QueueWithMetaData): TopologyNode {
    return {
      icon: faFolderSolid,
      path: `/${this.connection.id}/queues/${queue.name}`,
      name: queue.name,
      refreshable: true,
      availableMessageCounts: {
        'Active messages': queue.metaData.activeMessageCount,
        'Dead letters': queue.metaData.deadLetterMessageCount,
        'Transferring dead letters':
          queue.metaData.transferDeadLetterMessageCount,
      },
      defaultAction: {
        icon: 'pi pi-pencil',
        displayName: 'Edit queue',
        actionType: 'edit-queue',
        parameters: {
          connectionId: this.connection.id,
          queueName: queue.name,
        },
      },
      sendEndpoint: {
        displayName: queue.name,
        connectionId: this.connection.id,
        queueName: queue.name,
        endpoint: queue.name,
        endpointDisplay: queue.name,
        target: this.target,
      },
      receiveEndpoints: [
        {
          displayName: '',
          connectionId: this.connection.id,
          queueName: queue.name,
          target: this.target,
          channel: undefined,
        },
        {
          displayName: 'dead letters',
          connectionId: this.connection.id,
          queueName: `${queue.name}-deadletter`,
          target: this.target,
          channel: 'deadLetter',
        },
        {
          displayName: 'transfer dead letters',
          connectionId: this.connection.id,
          queueName: `${queue.name}-transfer`,
          target: this.target,
          channel: 'transferDeadLetter',
        },
      ],
      actions: [
        {
          icon: 'pi pi-pencil',
          displayName: 'Edit queue',
          actionType: 'edit-queue',
          parameters: {
            connectionId: this.connection.id,
            queueName: queue.name,
          },
        },
        {
          icon: 'pi pi-trash',
          displayName: 'Delete queue',
          actionType: 'delete-queue',
          parameters: {
            connectionId: this.connection.id,
            queueName: queue.name,
          },
        },
      ],
    };
  }
  private mapTopic(
    topic: TopicWithMetaData,
    subscriptions?: TopologyNode[],
  ): TopologyNode {
    return {
      path: `/${this.connection.id}/topics/${topic.name}`,
      name: topic.name,
      icon: faFolderTree,
      refreshable: true,
      sendEndpoint: {
        displayName: topic.name,
        connectionId: this.connection.id,
        topicName: topic.name,
        endpoint: topic.name,
        endpointDisplay: topic.name,
        target: this.target,
      },
      defaultAction: {
        icon: 'pi pi-pencil',
        displayName: 'Edit topic',
        actionType: 'edit-topic',
        parameters: {
          connectionId: this.connection.id,
          topicName: topic.name,
        },
        actionGroup: 'topic',
      },
      children: subscriptions,
      actions: [
        {
          icon: 'pi pi-plus',
          displayName: 'Add subscription',
          actionType: 'add-subscription',
          parameters: {
            connectionId: this.connection.id,
            topicName: topic.name,
          },
          actionGroup: 'subscriptions',
        },
        {
          icon: 'pi pi-pencil',
          displayName: 'Edit topic',
          actionType: 'edit-topic',
          parameters: {
            connectionId: this.connection.id,
            topicName: topic.name,
          },
          actionGroup: 'topic',
        },
        {
          icon: 'pi pi-trash',
          displayName: 'Delete topic',
          actionType: 'delete-topic',
          parameters: {
            connectionId: this.connection.id,
            topicName: topic.name,
          },
          actionGroup: 'topic',
        },
      ],
    };
  }

  private mapSubscription(
    subscription: SubscriptionWithMetaData,
    topicName: string,
  ): TopologyNode {
    return {
      icon: faFolder,
      path: `/${this.connection.id}/topics/${topicName}/${subscription.name}`,
      name: subscription.name,
      refreshable: true,
      availableMessageCounts: {
        'Active messages': subscription.metaData.activeMessageCount,
        'Dead letters': subscription.metaData.deadLetterMessageCount,
        'Transferring dead letters':
          subscription.metaData.transferDeadLetterMessageCount,
      },
      receiveEndpoints: [
        {
          displayName: subscription.name,
          connectionId: this.connection.id,
          topicName: topicName,
          subscriptionName: subscription.name,
          channel: undefined,
          target: this.target,
        },
        {
          target: this.target,
          displayName: 'dead letters',
          connectionId: this.connection.id,
          topicName: topicName,
          subscriptionName: subscription.name,
          channel: 'deadLetter',
        },
        {
          target: this.target,
          displayName: 'transfer dead letters',
          connectionId: this.connection.id,
          topicName: topicName,
          subscriptionName: subscription.name,
          channel: 'transferDeadLetter',
        },
      ],
      actions: [
        {
          icon: 'pi pi-plus',
          displayName: 'Add rule',
          actionType: 'add-rule',
          parameters: {
            connectionId: this.connection.id,
            topicName: topicName,
            subscriptionName: subscription.name,
          },
          actionGroup: 'rule',
        },
        {
          icon: 'pi pi-pencil',
          displayName: 'Edit subscription',
          actionType: 'edit-subscription',
          parameters: {
            connectionId: this.connection.id,
            topicName: topicName,
            subscriptionName: subscription.name,
          },
          actionGroup: 'subscription',
        },
        {
          icon: 'pi pi-trash',
          displayName: 'Delete subscription',
          actionType: 'delete-subscription',
          parameters: {
            connectionId: this.connection.id,
            topicName: topicName,
            subscriptionName: subscription.name,
          },
          actionGroup: 'subscription',
        },
      ],
      defaultAction: {
        icon: 'pi pi-pencil',
        displayName: 'Edit subscription',
        actionType: 'edit-subscription',
        parameters: {
          connectionId: this.connection.id,
          topicName: topicName,
          subscriptionName: subscription.name,
        },
        actionGroup: 'subscription',
      },
      children: subscription.rules.map(
        (rule): TopologyNode => ({
          icon: faCheckToSlot,
          name: rule.name,
          path: `/${this.connection.id}/topics/${topicName}/${subscription.name}/${rule.name}`,
          refreshable: false,
          defaultAction: {
            icon: 'pi pi-pencil',
            displayName: 'edit rule',
            actionType: 'edit-rule',
            parameters: {
              connectionId: this.connection.id,
              topicName: topicName,
              subscriptionName: subscription.name,
              ruleName: rule.name,
            },
          },
          actions: [
            {
              icon: 'pi pi-pencil',
              displayName: 'edit rule',
              actionType: 'edit-rule',
              parameters: {
                connectionId: this.connection.id,
                topicName: topicName,
                subscriptionName: subscription.name,
                ruleName: rule.name,
              },
            },
            {
              icon: 'pi pi-trash',
              displayName: 'Remove rule',
              actionType: 'remove-rule',
              parameters: {
                connectionId: this.connection.id,
                topicName: topicName,
                subscriptionName: subscription.name,
                ruleName: rule.name,
              },
            },
          ],
        }),
      ),
    };
  }
}
