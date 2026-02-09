import { UUID } from '@service-bus-browser/shared-contracts';
import { QueueWithMetaData } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusServerFunc } from './types';

const listQueues = async (body: {connectionId: UUID}, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getQueues();
}

const getQueue = async (body: { connectionId: UUID, queueId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getQueue(body.queueId);
}

const addQueue = async (body: { connectionId: UUID, queue: QueueWithMetaData }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({id: body.connectionId });

  if (connection === undefined) {
    throw new Error(`Connection ${ body.connectionId } not found`);
  }

  const administrationClient = connection.getAdministrationClient();
  return administrationClient.addQueue(body.queue);
}

const editQueue = async (body: { connectionId: UUID, queue: QueueWithMetaData }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateQueue(body.queue);
}

const removeQueue = async (body: { connectionId: UUID, queueId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteQueue(body.queueId);
}

export default new Map<string, ServiceBusServerFunc>([
  ['listQueues', listQueues],
  ['getQueue', getQueue],
  ['addQueue', addQueue],
  ['editQueue', editQueue],
  ['removeQueue', removeQueue],
]);

