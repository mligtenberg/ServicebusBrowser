import { UUID } from '@service-bus-browser/shared-contracts';
import { SubscriptionRule } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { getManagementClient } from './get-management-client';

const addSubscriptionRule = async (
  body: {
    connectionId: UUID;
    topicId: string;
    subscriptionId: string;
    rule: SubscriptionRule;
  },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(body.connectionId, connectionManager);
  return await managementClient.addSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
};

const editSubscriptionRule = async (
  body: {
    connectionId: UUID;
    topicId: string;
    subscriptionId: string;
    rule: SubscriptionRule;
  },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .updateSubscriptionRule(body.topicId, body.subscriptionId, body.rule);
};

const removeSubscriptionRule = async (
  body: {
    connectionId: UUID;
    topicId: string;
    subscriptionId: string;
    ruleName: string;
  },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .deleteSubscriptionRule(body.topicId, body.subscriptionId, body.ruleName);
};

export default new Map<string, ServiceBusServerFunc>([
  ['addSubscriptionRule', addSubscriptionRule],
  ['editSubscriptionRule', editSubscriptionRule],
  ['removeSubscriptionRule', removeSubscriptionRule],
]);
