import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';
import { Topic } from '@service-bus-browser/topology-contracts';

export const listTopics = async (body: {connectionId: UUID}) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopics();
}

export const getTopic = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopic(body.topicId);
}

export const createTopic = async (body: { connectionId: UUID, topic: Topic }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addTopic(body.topic);
}

export const updateTopic = async (body: { connectionId: UUID, topic: Topic }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateTopic(body.topic);
}

export const deleteTopic = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteTopic(body.topicId);
}
