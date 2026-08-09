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

const renameConnection = (
  body: { connectionId: UUID; name: string; workspaceId?: UUID },
  connectionManager: ConnectionManager,
) => {
  connectionManager.renameConnection(body.connectionId, body.name, body.workspaceId);
  return Promise.resolve();
};

const removeConnection = (
  body: { connectionId: UUID; workspaceId?: UUID },
  connectionManager: ConnectionManager,
) => {
  connectionManager.removeConnection(body.connectionId, body.workspaceId);
  return Promise.resolve();
};

const listConnections = async (
  body: { workspaceId: UUID },
  connectionManager: ConnectionManager,
) => {
  return Promise.resolve(connectionManager.listConnections(body.workspaceId));
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
  ['renameConnection', renameConnection],
  ['removeConnection', removeConnection],
  ['listConnections', listConnections],
  ['checkConnection', checkConnection],
]);
