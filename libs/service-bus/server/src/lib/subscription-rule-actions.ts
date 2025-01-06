import { UUID } from '@service-bus-browser/shared-contracts';
import { connectionManager } from './connection-manager-const';
import { SubscriptionRule } from '@service-bus-browser/topology-contracts';

export const addSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, rule: SubscriptionRule }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
}

export const editSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, rule: SubscriptionRule }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
}

export const removeSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, ruleName: string }) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteSubscriptionRule(body.topicId, body.subscriptionId, body.ruleName);
}
