import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { Connection } from '@service-bus-browser/service-bus-contracts';

const connectionManager = new ConnectionManager();

const addConnection =  (connection: Connection) => {
  return connectionManager.addConnection(connection);
};

const listConnections = async () => {
  return connectionManager.listConnections();
};

export default {
  addConnection,
  listConnections
}
