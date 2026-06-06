import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologyNode } from '@service-bus-browser/api-contracts';

// Actions that mutate a stored connection and therefore make no sense on a
// read-only connection store (e.g. the web variant).
const connectionMutationActions = ['connection:rename', 'connection:delete'];

const stripConnectionMutationActions = <T extends TopologyNode | undefined>(
  node: T,
): T => {
  if (!node?.actions?.length) {
    return node;
  }
  return {
    ...node,
    actions: node.actions.filter(
      (action) => !connectionMutationActions.includes(action.actionType),
    ),
  };
};

const listTopologies = async (
  body: unknown,
  connectionManager: ConnectionManager,
) => {
  const connections = connectionManager.listConnections();
  const topologies = await Promise.all(
    connections.map((connectionRef) => {
      const connectionClient = connectionManager.getConnectionClient({ id: connectionRef.connectionId});
      return connectionClient.getTopologyClient()?.getTopology();
    })
      .filter(promise => promise !== undefined),
  );

  if (!connectionManager.connectionsReadonly) {
    return topologies;
  }

  return topologies.map((topology) => stripConnectionMutationActions(topology));
}

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


  const connection = connectionManager.getConnectionClient({ id: body.path.split('/')[1] as UUID});
  const topology = await connection.getTopologyClient()?.refreshTopology(body.path);

  return connectionManager.connectionsReadonly
    ? stripConnectionMutationActions(topology)
    : topology;
}

export default new Map<string, ServiceBusServerFunc>([
  ['listTopologies', listTopologies],
  ['refreshTopology', refreshTopology],
]);
