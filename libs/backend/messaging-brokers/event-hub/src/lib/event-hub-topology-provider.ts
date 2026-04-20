import {
  EventHubConnection,
  MessageQueueTargetType,
  ReceiveOptionsDescription,
  TopologyNode,
  TopologyProvider,
} from '@service-bus-browser/api-contracts';
import { getCredential, getEntityPathFromConnectionString } from './internal/credential-helper';
import {
  listEventHubs,
  listConsumerGroups,
  getEventHubInfo,
  EventHubInfo,
} from './internal/namespace-rest-client';
import { faFolder, faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { sbbAzureEventHub } from '@service-bus-browser/custom-icons';

export class EventHubTopologyProvider implements TopologyProvider {
  readonly target: MessageQueueTargetType = 'eventHub';

  private readonly availableOptions: ReceiveOptionsDescription = {
    genericOptions: {
      maxAmountOfMessagesToReceive: {
        type: 'number',
        label: 'Max amount of messages to receive',
      },
    },
    modes: {
      peek: {
        fromSequenceNumber: {
          type: 'string',
          label: 'From sequence number',
          pattern: '^[0-9]+$',
        },
      },
    },
  };

  constructor(private connection: EventHubConnection) {}

  async getTopology(): Promise<TopologyNode> {
    const eventHubs = await this.loadEventHubs();

    return {
      path: `/${this.connection.id}`,
      name: this.connection.name,
      icon: sbbAzureEventHub,
      refreshable: true,
      selectable: true,
      type: 'connection',
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
      children: [eventHubs],
    };
  }

  async refreshTopology(refreshFromPath: string): Promise<TopologyNode> {
    if (refreshFromPath === '/') {
      return this.getTopology();
    }

    const segments = refreshFromPath.split('/');
    if (!segments[2]) {
      return this.getTopology();
    }

    if (segments[2] === 'event-hubs') {
      return this.refreshEventHubs(segments);
    }

    throw new Error('Invalid path');
  }

  private async refreshEventHubs(segments: string[]): Promise<TopologyNode> {
    const eventHubName = segments[3];
    if (!eventHubName) {
      return await this.loadEventHubs();
    }

    const credential = getCredential(this.connection);
    const hubInfo = await getEventHubInfo(credential, eventHubName);
    const consumerGroups = await listConsumerGroups(credential, eventHubName);

    const consumerGroupNodes = consumerGroups.map((cg) =>
      this.mapConsumerGroup(eventHubName, cg.name),
    );

    return this.mapEventHub(hubInfo, consumerGroupNodes);
  }

  private async loadEventHubs(): Promise<TopologyNode> {
    try {
      const credential = getCredential(this.connection);

      let hubInfos: EventHubInfo[];

      if (
        this.connection.type === 'connectionString' &&
        getEntityPathFromConnectionString(this.connection.connectionString)
      ) {
        const entityPath = getEntityPathFromConnectionString(this.connection.connectionString)!;
        const hubInfo = await getEventHubInfo(credential, entityPath);
        hubInfos = [hubInfo];
      } else {
        hubInfos = await listEventHubs(credential);
      }

      const hubNodes = await Promise.all(
        hubInfos.map(async (hub) => {
          const consumerGroups = await listConsumerGroups(credential, hub.name);
          const consumerGroupNodes = consumerGroups.map((cg) =>
            this.mapConsumerGroup(hub.name, cg.name),
          );
          return this.mapEventHub(hub, consumerGroupNodes);
        }),
      );

      return {
        path: `/${this.connection.id}/event-hubs`,
        name: 'Event Hubs',
        selectable: false,
        type: 'operational-grouping',
        refreshable: true,
        children: hubNodes,
        actions: [],
      };
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error((err as { toString(): string })?.toString() ?? 'Unknown error');
      return {
        path: `/${this.connection.id}/event-hubs`,
        name: 'Event Hubs',
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

  private mapEventHub(hub: EventHubInfo, consumerGroupNodes: TopologyNode[]): TopologyNode {
    return {
      icon: faFolderOpen,
      path: `/${this.connection.id}/event-hubs/${hub.name}`,
      name: hub.name,
      refreshable: true,
      selectable: true,
      type: 'eventHub',
      sendEndpoint: {
        displayName: hub.name,
        connectionId: this.connection.id,
        eventHubName: hub.name,
        endpoint: `${this.getHostName()}/${hub.name}`,
        endpointDisplay: hub.name,
        target: 'eventHub',
        type: 'eventHub',
        supportedMessageAnnotations: [
          {
            key: 'partitionKey',
            description: 'Key used to determine which partition the event is sent to.',
            displayType: 'string',
          },
        ],
      },
      children: consumerGroupNodes,
      actions: [],
    };
  }

  private mapConsumerGroup(eventHubName: string, consumerGroupName: string): TopologyNode {
    return {
      icon: faFolder,
      path: `/${this.connection.id}/event-hubs/${eventHubName}/${consumerGroupName}`,
      name: consumerGroupName,
      refreshable: true,
      selectable: true,
      type: 'consumerGroup',
      receiveEndpoints: [
        {
          displayName: consumerGroupName,
          longDisplayName: `${eventHubName} / ${consumerGroupName}`,
          connectionId: this.connection.id,
          eventHubName,
          consumerGroup: consumerGroupName,
          target: 'eventHub',
          type: 'consumerGroup',
          receiveOptionsDescription: this.availableOptions,
          clearable: false,
        },
      ],
      actions: [],
    };
  }

  private getHostName(): string {
    if (this.connection.type === 'connectionString') {
      const credential = getCredential(this.connection);
      return credential.hostName;
    }
    return this.connection.fullyQualifiedNamespace;
  }
}
