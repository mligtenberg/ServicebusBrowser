import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusServerFunc } from './types';

const addConnection = (connection: Connection, connectionManager: ConnectionManager,) => {
  connectionManager.addConnection(connection);
  return Promise.resolve();
};

const removeConnection = (body: { connectionId: UUID }, connectionManager: ConnectionManager) => {
  connectionManager.removeConnection(body.connectionId);
  return Promise.resolve();
}

const listConnections = async (body: void, connectionManager: ConnectionManager) => {
  return Promise.resolve(connectionManager.listConnections());
};

const checkConnection = async (connection: Connection, connectionManager: ConnectionManager) => {
  const connectionClient = connectionManager.getConnectionClient({ connection });
  return await connectionClient.getAdministrationClient().checkConnection();
}

export default new Map<string, ServiceBusServerFunc>([
  ['addConnection', addConnection],
  ['removeConnection', removeConnection],
  ['listConnections', listConnections],
  ['checkConnection', checkConnection],
]);
