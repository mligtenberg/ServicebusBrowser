import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { QueueWithMetaData } from '@service-bus-browser/topology-contracts';

const connectionManager = new ConnectionManager();

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

const listQueues = async (body: {connectionId: UUID}) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getQueues();
}

const listTopics = async (body: {connectionId: UUID}) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopics();
}

const listSubscriptions = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscriptions(body.topicId);
}

const addQueue = async (body: { connectionId: UUID, queue: QueueWithMetaData }) => {
  const connection = connectionManager.getConnectionClient({id: body.connectionId });

  if (connection === undefined) {
    throw new Error(`Connection ${ body.connectionId } not found`);
  }

  const administrationClient = connection.getAdministrationClient();
  return administrationClient.addQueue(body.queue);
}

export default {
  addConnection,
  removeConnection,
  listConnections,
  checkConnection,
  listQueues,
  listTopics,
  listSubscriptions,
  addQueue
}
