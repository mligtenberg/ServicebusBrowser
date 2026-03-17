import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';

const addConnection = (
  connection: Connection,
  connectionManager: ConnectionManager,
) => {
  connectionManager.addConnection(connection);
  return Promise.resolve();
};

const removeConnection = (
  body: { connectionId: UUID },
  connectionManager: ConnectionManager,
) => {
  connectionManager.removeConnection(body.connectionId);
  return Promise.resolve();
};

const listConnections = async (
  body: void,
  connectionManager: ConnectionManager,
) => {
  return Promise.resolve(connectionManager.listConnections());
};

const checkConnection = async (
  connection: Connection,
  connectionManager: ConnectionManager,
) => {
  const connectionClient = connectionManager.getConnectionClient({
    connection,
  });
  return (await connectionClient.getConnectionValidator()?.validateConnection()) ?? false;
};

export default new Map<string, ServiceBusServerFunc>([
  ['addConnection', addConnection],
  ['removeConnection', removeConnection],
  ['listConnections', listConnections],
  ['checkConnection', checkConnection],
]);
