import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';
import { Subscription } from '@service-bus-browser/topology-contracts';

export const listSubscriptions = async (body: { connectionId: UUID, topicId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscriptions(body.topicId);
}

export const getSubscription = async (body: { connectionId: UUID, topicId: string, subscriptionId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscription(body.topicId, body.subscriptionId);
}

export const createSubscription = async (body: { connectionId: UUID, topicId: string, subscription: Subscription }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addSubscription(body.topicId, body.subscription);
}

export const updateSubscription = async (body: { connectionId: UUID, topicId: string, subscription: Subscription }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateSubscription(body.topicId, body.subscription);
}

export const deleteSubscription = async (body: { connectionId: UUID, topicId: string, subscriptionId: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteSubscription(body.topicId, body.subscriptionId);
}
