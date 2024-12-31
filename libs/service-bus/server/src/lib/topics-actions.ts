import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';

export const listTopics = async (body: {connectionId: UUID}) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopics();
}

export const getTopic = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getTopic(body.topicId);
}
