import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologyNode } from '@service-bus-browser/api-contracts';

// Actions that mutate a stored connection and therefore make no sense on a
// read-only connection store (e.g. the web variant).
const connectionMutationActionTypes = ['connection:rename', 'connection:delete'];

const stripConnectionMutationActions = <T extends TopologyNode | undefined>(
  node: T,
): T => {
  if (!node?.actions?.length) {
    return node;
  }
  return {
    ...node,
    actions: node.actions.filter(
      (action) => !connectionMutationActionTypes.includes(action.actionType),
    ),
  };
};

const buildConnectionMutationActions = (connectionId: UUID, connectionName: string) => [
  {
    icon: 'fa-solid fa-pencil',
    displayName: `Rename ${connectionName}`,
    actionGroup: 'connection',
    actionType: 'connection:rename',
    parameters: { connectionId, connectionName },
  },
  {
    icon: 'fa-solid fa-trash',
    displayName: `Remove ${connectionName}`,
    actionGroup: 'connection',
    actionType: 'connection:delete',
    parameters: { connectionId, connectionName },
  },
];

const injectConnectionMutationActions = (
  node: TopologyNode,
  connectionId: UUID,
  connectionName: string,
): TopologyNode => ({
  ...node,
  actions: [
    ...(node.actions ?? []),
    ...buildConnectionMutationActions(connectionId, connectionName),
  ],
});

const listTopologies = async (
  body: unknown,
  connectionManager: ConnectionManager,
) => {
  const connections = connectionManager.listConnections();
  const topologies = await Promise.all(
    connections.map(async ({ connectionId, connectionName }) => {
      let node: TopologyNode | undefined;
      try {
        node = await connectionManager
          .getConnectionClient({ id: connectionId })
          .getTopologyClient()
          ?.getTopology();
      } catch {
        node = undefined;
      }

      if (!node) {
        node = {
          path: `/${connectionId}`,
          name: connectionName,
          refreshable: true,
          selectable: true,
          type: 'connection',
          children: [],
          actions: [],
          errored: true,
          errorMessage: 'Could not connect',
        };
      }

      if (connectionManager.connectionsReadonly) {
        return stripConnectionMutationActions(node);
      }

      return injectConnectionMutationActions(node, connectionId, connectionName);
    }),
  );

  return topologies;
};

const refreshTopology = async (
  body: { path: string },
  connectionManager: ConnectionManager,
) => {
  if (body.path === '/') {
    throw new Error(`Invalid topology path for refresh: ${body.path}`);
  }

  const connectionId = body.path.split('/')[1] as UUID;
  if (!connectionId) {
    throw new Error(`Invalid topology path: ${body.path}`);
  }

  const connection = connectionManager.getConnectionClient({ id: connectionId });
  let topology = await connection.getTopologyClient()?.refreshTopology(body.path);

  if (connectionManager.connectionsReadonly) {
    return stripConnectionMutationActions(topology);
  }

  if (topology?.type === 'connection') {
    const connectionRef = connectionManager.listConnections()
      .find((c) => c.connectionId === connectionId);
    const connectionName = connectionRef?.connectionName ?? topology.name;
    topology = injectConnectionMutationActions(topology, connectionId, connectionName);
  }

  return topology;
};

export default new Map<string, ServiceBusServerFunc>([
  ['listTopologies', listTopologies],
  ['refreshTopology', refreshTopology],
]);
