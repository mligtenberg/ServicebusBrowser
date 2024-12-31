import { UUID } from '@service-bus-browser/shared-contracts';
import { QueueWithMetaData } from '@service-bus-browser/topology-contracts';
import { connectionManager } from './connection-manager-const';

export const listQueues = async (body: {connectionId: UUID}) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getQueues();
}

export const getQueue = async (body: { connectionId: UUID, queueId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getQueue(body.queueId);
}

export const addQueue = async (body: { connectionId: UUID, queue: QueueWithMetaData }) => {
  const connection = connectionManager.getConnectionClient({id: body.connectionId });

  if (connection === undefined) {
    throw new Error(`Connection ${ body.connectionId } not found`);
  }

  const administrationClient = connection.getAdministrationClient();
  return administrationClient.addQueue(body.queue);
}

export const editQueue = async (body: { connectionId: UUID, queue: QueueWithMetaData }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateQueue(body.queue);
}

export const removeQueue = async (body: { connectionId: UUID, queueId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteQueue(body.queueId);
}
