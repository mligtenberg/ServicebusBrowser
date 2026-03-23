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
  faRightLeft,
} from '@fortawesome/free-solid-svg-icons';
import {
  RabbitMqManagementClient,
  RabbitMqQueue,
} from './rabbitmq-management-client';

export class RabbitMqTopologyProvider implements TopologyProvider {
  readonly target: MessageQueueTargetType = 'rabbitmq';
  private readonly managementClient;
  private readonly queueOptions: ReceiveOptionsDescription = {
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
  private readonly streamOptions: ReceiveOptionsDescription = {
    genericOptions: {
      maxAmountOfMessagesToReceive: {
        type: 'number',
        label: 'Max amount of messages to receive',
      },
      streamOffset: {
        type: 'number',
        label: 'Stream offset',
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
    try {
      const vhosts = await this.loadVHosts();

      return {
        path: `/${this.connection.id}`,
        name: this.connection.name,
        icon: faServer,
        refreshable: true,
        selectable: true,
        type: 'connection',
        children: vhosts,
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
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        path: `/${this.connection.id}`,
        name: this.connection.name,
        icon: faServer,
        refreshable: true,
        selectable: true,
        type: 'connection',
        children: [],
        actions: [],
        errored: true,
        errorMessage: error.message,
      }
    }
  }

  refreshTopology(refreshFromPath: string): Promise<TopologyNode> {
    if (
      refreshFromPath === '/' ||
      refreshFromPath === `/${this.connection.id}`
    ) {
      return this.getTopology();
    }

    const segments = refreshFromPath.split('/').filter(Boolean);
    if (segments[1] === 'vhosts') {
      return this.refreshVHostNode(segments);
    }

    return this.getTopology();
  }

  private async loadVHosts(): Promise<TopologyNode[]> {
    const vhosts = await this.managementClient.getVHosts();
    return await Promise.all(vhosts.map((vhost) => this.mapVHost(vhost.name)));
  }

  private async refreshVHostNode(segments: string[]): Promise<TopologyNode> {
    const encodedVHost = segments[2];
    if (!encodedVHost) {
      throw new Error('Invalid path');
    }

    const vhostName = decodeURIComponent(encodedVHost);

    if (segments.length === 3) {
      return this.mapVHost(vhostName);
    }

    const nodeType = segments[3];
    if (nodeType === 'queues') {
      const queueName = segments[4]
        ? decodeURIComponent(segments[4])
        : undefined;
      if (!queueName) {
        return this.loadQueues(vhostName);
      }

      const queue = await this.managementClient.getQueueByVHost(
        vhostName,
        queueName,
      );
      return this.mapQueue(queue, vhostName);
    }

    if (nodeType === 'exchanges') {
      return this.loadExchanges(vhostName);
    }

    return this.mapVHost(vhostName);
  }

  private async mapVHost(vhostName: string): Promise<TopologyNode> {
    const encodedVHost = encodeURIComponent(vhostName);
    const [queuesNode, exchangesNode] = await Promise.all([
      this.loadQueues(vhostName),
      this.loadExchanges(vhostName),
    ]);

    return {
      icon: faFolderSolid,
      path: `/${this.connection.id}/vhosts/${encodedVHost}`,
      name: vhostName,
      refreshable: true,
      selectable: false,
      type: 'operational-grouping',
      children: [queuesNode, exchangesNode],
    };
  }

  private async loadQueues(vhostName: string): Promise<TopologyNode> {
    const encodedVHost = encodeURIComponent(vhostName);
    const path = `/${this.connection.id}/vhosts/${encodedVHost}/queues`;

    try {
      const queues = await this.managementClient.getQueuesByVHost(vhostName);
      return {
        path,
        name: 'Queues',
        selectable: false,
        type: 'operational-grouping',
        refreshable: true,
        children: queues.map((queue) => this.mapQueue(queue, vhostName)),
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        path,
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

  private async loadExchanges(vhostName: string): Promise<TopologyNode> {
    const encodedVHost = encodeURIComponent(vhostName);
    const path = `/${this.connection.id}/vhosts/${encodedVHost}/exchanges`;

    try {
      const exchanges =
        await this.managementClient.getExchangesByVHost(vhostName);
      return {
        path,
        name: 'Exchanges',
        selectable: false,
        type: 'operational-grouping',
        refreshable: true,
        children: exchanges
          .filter((exchange) => exchange.name)
          .map((exchange) => this.mapExchange(vhostName, exchange)),
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        path,
        name: 'Exchanges',
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

  private mapQueue(queue: RabbitMqQueue, vhostName: string): TopologyNode {
    const encodedVHost = encodeURIComponent(vhostName ?? '/');
    const encodedQueueName = encodeURIComponent(queue.name);
    const endpointDisplay =
      `${this.connection.host}:${this.connection.amqpPort}` +
      `/${vhostName ?? '/'}/${queue.name}`;

    const receiveEndpointLongName = [vhostName, queue.name]
      .map((part) => part.replace(/^\/?(.*?)\/?$/, '$1'))
      .filter((p) => p !== '')
      .join('/');

    return {
      icon: faFolderSolid,
      path: `/${this.connection.id}/vhosts/${encodedVHost}/queues/${encodedQueueName}`,
      name: queue.name,
      refreshable: true,
      selectable: true,
      type: 'queue',
      availableMessageCounts: [
        {
          name: 'Total messages',
          count: queue.messages ?? 0,
          showInSummary: true,
        },
        {
          name: 'Ready messages',
          count: queue.messages_ready ?? 0,
          showInSummary: false,
        },
        {
          name: 'Unacked messages',
          count: queue.messages_unacknowledged ?? 0,
          showInSummary: false,
        },
      ],
      sendEndpoint: {
        displayName: queue.name,
        connectionId: this.connection.id,
        vhostName: vhostName ?? '/',
        queueName: queue.name,
        endpoint: `${this.connection.host}:${this.connection.amqpPort}`,
        endpointDisplay,
        target: 'rabbitmq',
        type: 'queue',
        supportedMessageAnnotations: [],
      },
      receiveEndpoints: [
        {
          displayName: '',
          longDisplayName: receiveEndpointLongName,
          connectionId: this.connection.id,
          vhostName: vhostName ?? '/',
          queueName: queue.name,
          target: 'rabbitmq',
          type: 'queue',
          receiveOptionsDescription:
            queue.type === 'stream' ? this.streamOptions : this.queueOptions,
          queueType: queue.type,
          clearable: queue.type !== 'stream',
        },
      ],
    };
  }

  private mapExchange(
    vhostName: string,
    exchange: {
      name: string;
      type: string;
      durable: boolean;
      auto_delete: boolean;
      internal: boolean;
    },
  ): TopologyNode {
    const encodedVHost = encodeURIComponent(vhostName);
    const encodedExchangeName = encodeURIComponent(exchange.name);
    const properties = [
      `type=${exchange.type}`,
      exchange.durable ? 'durable' : 'non-durable',
      exchange.auto_delete ? 'auto-delete' : 'manual-delete',
      exchange.internal ? 'internal' : 'public',
    ];

    return {
      icon: faRightLeft,
      path: `/${this.connection.id}/vhosts/${encodedVHost}/exchanges/${encodedExchangeName}`,
      name: exchange.name,
      refreshable: false,
      selectable: true,
      type: 'exchange',
      sendEndpoint: {
        displayName: exchange.name,
        connectionId: this.connection.id,
        vhostName,
        exchangeName: exchange.name,
        endpoint: `${this.connection.host}:${this.connection.amqpPort}`,
        endpointDisplay:
          `${this.connection.host}:${this.connection.amqpPort}` +
          `/${vhostName}/${exchange.name} (${properties.join(', ')})`,
        target: 'rabbitmq',
        type: 'exchange',
        supportedMessageAnnotations: [],
      },
    };
  }
}
