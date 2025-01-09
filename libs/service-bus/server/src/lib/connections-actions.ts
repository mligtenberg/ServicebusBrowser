import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';

export const addConnection =  (connection: Connection) => {
  return connectionManager.addConnection(connection);
};

export const removeConnection = (body: { connectionId: UUID }) => {
  return connectionManager.removeConnection(body.connectionId);
}

export const listConnections = async () => {
  return connectionManager.listConnections();
};

export const checkConnection = async (connection: Connection) => {
  const connectionClient = connectionManager.getConnectionClient({ connection });
  return await connectionClient.getAdministrationClient().checkConnection();
}
