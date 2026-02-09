import { UUID } from '@service-bus-browser/shared-contracts';
import { Topic } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusServerFunc } from './types';

const listTopics = async (body: {connectionId: UUID}, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopics();
}

const getTopic = async (body: { connectionId: UUID, topicId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopic(body.topicId);
}

const createTopic = async (body: { connectionId: UUID, topic: Topic }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addTopic(body.topic);
}

const updateTopic = async (body: { connectionId: UUID, topic: Topic }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateTopic(body.topic);
}

const deleteTopic = async (body: { connectionId: UUID, topicId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteTopic(body.topicId);
}

export default new Map<string, ServiceBusServerFunc>([
  ['listTopics', listTopics],
  ['getTopic', getTopic],
  ['createTopic', createTopic],
  ['updateTopic', updateTopic],
  ['deleteTopic', deleteTopic],
])
