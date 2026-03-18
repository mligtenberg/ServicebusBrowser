import {
  MessageQueueTargetType,
  RabbitMqConnection,
  ReceiveOptionsDescription,
  TopologyNode,
  TopologyProvider,
} from '@service-bus-browser/api-contracts';
import {
  faFolder as faFolderSolid,
  faServer,
} from '@fortawesome/free-solid-svg-icons';
import { RabbitMqManagementClient } from './rabbitmq-management-client';

export class RabbitMqTopologyProvider implements TopologyProvider {
  readonly target: MessageQueueTargetType = 'rabbitmq';
  private readonly managementClient;
  private readonly availableOptions: ReceiveOptionsDescription = {
    genericOptions: {
      maxAmountOfMessagesToReceive: {
        type: 'number',
        label: 'Max amount of messages to receive',
      },
    },
    modes: {
      peek: {},
      receive: {},
    },
  };

  constructor(private readonly connection: RabbitMqConnection) {
    this.managementClient = new RabbitMqManagementClient(connection);
  }

  async getTopology(): Promise<TopologyNode> {
    return {
      path: `/${this.connection.id}`,
      name: this.connection.name,
      icon: faServer,
      refreshable: true,
      selectable: true,
      type: 'connection',
      children: [await this.loadQueues()],
      actions: [
        {
          icon: 'pi pi-trash',
          displayName: `Remove ${this.connection.name}`,
          actionGroup: 'connection',
          actionType: 'connection:delete',
          parameters: {
            connectionId: this.connection.id,
            connectionName: this.connection.name,
          },
        },
      ],
    };
  }

  refreshTopology(refreshFromPath: string): Promise<TopologyNode> {
    if (
      refreshFromPath === '/' ||
      refreshFromPath === `/${this.connection.id}`
    ) {
      return this.getTopology();
    }

    const segments = refreshFromPath.split('/');
    if (segments[2] === 'queues') {
      return this.refreshQueues(segments);
    }

    return this.getTopology();
  }

  private async refreshQueues(segments: string[]): Promise<TopologyNode> {
    const queueName = segments[3];
    if (!queueName) {
      return this.loadQueues();
    }

    const queue = await this.managementClient.getQueue(queueName);
    return this.mapQueue(queue);
  }

  private async loadQueues(): Promise<TopologyNode> {
    try {
      const queues = await this.managementClient.getQueues();
      return {
        path: `/${this.connection.id}/queues`,
        name: 'Queues',
        selectable: false,
        type: 'operational-grouping',
        refreshable: true,
        children: queues.map((queue) => this.mapQueue(queue)),
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        path: `/${this.connection.id}/queues`,
        name: 'Queues',
        selectable: false,
        type: 'operational-grouping',
        refreshable: true,
        children: [],
        actions: [],
        errored: true,
        errorMessage: error.message,
      };
    }
  }

  private mapQueue(queue: {
    name: string;
    messages: number;
    messages_ready: number;
    messages_unacknowledged: number;
  }): TopologyNode {
    return {
      icon: faFolderSolid,
      path: `/${this.connection.id}/queues/${queue.name}`,
      name: queue.name,
      refreshable: true,
      selectable: true,
      type: 'queue',
      availableMessageCounts: [
        {
          name: 'Total messages',
          count: queue.messages ?? 0,
          showInSummary: true
        },
        {
          name: 'Ready messages',
          count: queue.messages_ready ?? 0,
          showInSummary: false
        },
        {
          name: 'Unacked messages',
          count: queue.messages_unacknowledged ?? 0,
          showInSummary: false
        }
      ],
      sendEndpoint: {
        displayName: queue.name,
        connectionId: this.connection.id,
        queueName: queue.name,
        endpoint: `${this.connection.host}:${this.connection.amqpPort}`,
        endpointDisplay: `${this.connection.host}:${this.connection.amqpPort}`,
        target: 'rabbitmq',
        type: 'queue',
      },
      receiveEndpoints: [
        {
          displayName: '',
          longDisplayName: queue.name,
          connectionId: this.connection.id,
          queueName: queue.name,
          target: 'rabbitmq',
          type: 'queue',
          receiveOptionsDescription: this.availableOptions,
        },
      ],
    };
  }
}
