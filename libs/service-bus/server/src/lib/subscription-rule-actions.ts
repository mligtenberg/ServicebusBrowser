import { UUID } from '@service-bus-browser/shared-contracts';
import { SubscriptionRule } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusServerFunc } from './types';

const addSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, rule: SubscriptionRule }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().addSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
}

const editSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, rule: SubscriptionRule }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().updateSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
}

const removeSubscriptionRule = async (body: { connectionId: UUID, topicId: string, subscriptionId: string, ruleName: string }, connectionManager: ConnectionManager) => {
  const connection = connectionManager.getConnectionClient({ id: body.connectionId });
  return await connection.getAdministrationClient().deleteSubscriptionRule(body.topicId, body.subscriptionId, body.ruleName);
}

export default new Map<string, ServiceBusServerFunc>([
  ['addSubscriptionRule', addSubscriptionRule],
  ['editSubscriptionRule', editSubscriptionRule],
  ['removeSubscriptionRule', removeSubscriptionRule],
]);
