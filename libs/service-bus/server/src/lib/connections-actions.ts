import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

export const addConnection =  (connection: Connection, connectionManager: ConnectionManager) => {
  return connectionManager.addConnection(connection);
};

export const removeConnection = (body: { connectionId: UUID }, connectionManager: ConnectionManager) => {
  return connectionManager.removeConnection(body.connectionId);
}

export const listConnections = async (body: void, connectionManager: ConnectionManager) => {
  return connectionManager.listConnections();
};

export const checkConnection = async (connection: Connection, connectionManager: ConnectionManager) => {
  const connectionClient = connectionManager.getConnectionClient({ connection });
  return await connectionClient.getAdministrationClient().checkConnection();
}
