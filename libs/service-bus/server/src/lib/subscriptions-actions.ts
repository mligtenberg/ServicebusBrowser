import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';

export const listSubscriptions = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscriptions(body.topicId);
}

export const getSubscription = async (body: { connectionId: UUID, topicId: string, subscriptionId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscription(body.topicId, body.subscriptionId);
}
