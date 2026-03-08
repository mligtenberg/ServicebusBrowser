import {
  Connection,
  MessageQueueTargetType,
  TopologyNode,
  TopologyProvider,
} from '@service-bus-browser/api-contracts';
import { ServiceBusManagementClient } from './service-bus-management-client';
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
  readonly target: MessageQueueTargetType = 'serviceBus';
  private administrationClient;

  constructor(private connection: Connection) {
    this.administrationClient = new ServiceBusManagementClient(this.connection);
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
      selectable: true,
      type: 'connection',
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
      children: [queues, topics],
    };
  }

  refreshTopology(refreshFromPath: string): Promise<TopologyNode> {
    if (refreshFromPath === '/') {
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
      return await this.loadQueues();
    }

    const queue = await this.administrationClient.getQueue(queueName);
    return this.mapQueue(queue);
  }

  private async refreshTopics(segements: string[]): Promise<TopologyNode> {
    const topicName = segements[3];
    if (!topicName) {
      return await this.loadTopics();
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
    const childNodes = queues.map(
      (queue): TopologyNode => this.mapQueue(queue),
    );

    return {
      path: `/${this.connection.id}/queues`,
      name: 'Queues',
      selectable: false,
      type: 'operational-grouping',
      refreshable: true,
      children: childNodes,
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
    };
  }

  private async loadTopics() {
    const topics = await this.administrationClient.getTopics();
    const subscriptions = await Promise.all(
      topics.map((topic) => this.loadSubscriptions(topic.name)),
    );

    const childNodes = topics.map(
      (topic, index): TopologyNode =>
        this.mapTopic(topic, subscriptions[index]),
    );

    return {
      path: `/${this.connection.id}/topics`,
      name: 'Topics',
      selectable: false,
      type: 'operational-grouping',
      refreshable: true,
      children: childNodes,
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
    };
  }

  private async loadSubscriptions(topicName: string) {
    const subscriptions =
      await this.administrationClient.getSubscriptions(topicName);
    return subscriptions.map(
      (subscription): TopologyNode =>
        this.mapSubscription(subscription, topicName),
    );
  }

  private mapQueue(queue: QueueWithMetaData): TopologyNode {
    return {
      icon: faFolderSolid,
      path: `/${this.connection.id}/queues/${queue.name}`,
      name: queue.name,
      refreshable: true,
      selectable: true,
      type: 'queue',
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
        endpoint: queue.metaData.endpoint,
        endpointDisplay: queue.metaData.endpointDisplay,
        target: 'serviceBus',
        type: 'queue',
      },
      receiveEndpoints: [
        {
          displayName: '',
          connectionId: this.connection.id,
          queueName: queue.name,
          target: 'serviceBus',
          type: 'queue',
          channel: undefined,
        },
        {
          displayName: 'dead letters',
          connectionId: this.connection.id,
          queueName: `${queue.name}-deadletter`,
          target: 'serviceBus',
          type: 'queue',
          channel: 'deadLetter',
        },
        {
          displayName: 'transfer dead letters',
          connectionId: this.connection.id,
          queueName: `${queue.name}-transfer`,
          target: 'serviceBus',
          type: 'queue',
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
      selectable: true,
      type: 'topic',
      sendEndpoint: {
        displayName: topic.name,
        connectionId: this.connection.id,
        topicName: topic.name,
        endpoint: topic.metadata.endpoint,
        endpointDisplay: topic.metadata.endpointDisplay,
        target: 'serviceBus',
        type: 'topic',
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
      selectable: true,
      type: 'subscription',
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
          target: 'serviceBus',
          type: 'subscription',
        },
        {
          target: 'serviceBus',
          type: 'subscription',
          displayName: 'dead letters',
          connectionId: this.connection.id,
          topicName: topicName,
          subscriptionName: subscription.name,
          channel: 'deadLetter',
        },
        {
          target: 'serviceBus',
          type: 'subscription',
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
          selectable: true,
          type: 'rule',
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
