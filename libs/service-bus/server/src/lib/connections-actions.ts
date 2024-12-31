import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';

export const addConnection =  (connection: Connection) => {
  return connectionManager.addConnection(connection);
};

export const removeConnection = (id: UUID) => {
  return connectionManager.removeConnection({connectionId: id});
}

export const listConnections = async () => {
  return connectionManager.listConnections();
};

export const checkConnection = async (connection: Connection) => {
  const connectionClient = connectionManager.getConnectionClient({ connection });
  return await connectionClient.getAdministrationClient().checkConnection();
}
