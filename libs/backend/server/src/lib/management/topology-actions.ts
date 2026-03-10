import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { UUID } from '@service-bus-browser/shared-contracts';

const listTopologies = async (
  body: unknown,
  connectionManager: ConnectionManager,
) => {
  const connections = connectionManager.listConnections();
  return await Promise.all(
    connections.map((connectionRef) => {
      const connectionClient = connectionManager.getConnectionClient({ id: connectionRef.connectionId});
      return connectionClient.getTopologyClient()?.getTopology();
    })
      .filter(promise => promise !== undefined),
  );
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
  return connection.getTopologyClient()?.refreshTopology(body.path);
}

export default new Map<string, ServiceBusServerFunc>([
  ['listTopologies', listTopologies],
  ['refreshTopology', refreshTopology],
]);
