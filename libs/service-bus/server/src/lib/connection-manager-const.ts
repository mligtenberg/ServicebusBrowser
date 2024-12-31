import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export const connectionManager = new ConnectionManager();

const addConnection =  (connection: Connection) => {
  return connectionManager.addConnection(connection);
};

const removeConnection = (id: UUID) => {
  return connectionManager.removeConnection({connectionId: id});
}

const listConnections = async () => {
  return connectionManager.listConnections();
};

const checkConnection = async (connection: Connection) => {
  const connectionClient = connectionManager.getConnectionClient({ connection });
  return await connectionClient.getAdministrationClient().checkConnection();
}


export default {
  addConnection,
  removeConnection,
  listConnections,
  checkConnection
}
