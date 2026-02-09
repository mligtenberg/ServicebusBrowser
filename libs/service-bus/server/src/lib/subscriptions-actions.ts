import { UUID } from '@service-bus-browser/shared-contracts';
import { Subscription } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusServerFunc } from './types';

const listSubscriptions = async (body: { connectionId: UUID, topicId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscriptions(body.topicId);
}

const getSubscription = async (body: { connectionId: UUID, topicId: string, subscriptionId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().getSubscription(body.topicId, body.subscriptionId);
}

const createSubscription = async (body: { connectionId: UUID, topicId: string, subscription: Subscription }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addSubscription(body.topicId, body.subscription);
}

const updateSubscription = async (body: { connectionId: UUID, topicId: string, subscription: Subscription }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateSubscription(body.topicId, body.subscription);
}

const deleteSubscription = async (body: { connectionId: UUID, topicId: string, subscriptionId: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteSubscription(body.topicId, body.subscriptionId);
}

export default new Map<string, ServiceBusServerFunc>([
  ['listSubscriptions', listSubscriptions],
  ['getSubscription', getSubscription],
  ['createSubscription', createSubscription],
  ['updateSubscription', updateSubscription],
  ['deleteSubscription', deleteSubscription],
]);
