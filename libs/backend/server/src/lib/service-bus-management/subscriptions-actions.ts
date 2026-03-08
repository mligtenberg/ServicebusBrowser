import { UUID } from '@service-bus-browser/shared-contracts';
import { Subscription } from '@service-bus-browser/topology-contracts';
import { ConnectionManager } from "../clients/connection-manager";
import { ServiceBusServerFunc } from '../types';
import { getManagementClient } from './get-management-client';

const listSubscriptions = async (
  body: { connectionId: UUID; topicId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .getSubscriptions(body.topicId);
};

const getSubscription = async (
  body: { connectionId: UUID; topicId: string; subscriptionId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .getSubscription(body.topicId, body.subscriptionId);
};

const createSubscription = async (
  body: { connectionId: UUID; topicId: string; subscription: Subscription },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .addSubscription(body.topicId, body.subscription);
};

const updateSubscription = async (
  body: { connectionId: UUID; topicId: string; subscription: Subscription },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .updateSubscription(body.topicId, body.subscription);
};

const deleteSubscription = async (
  body: { connectionId: UUID; topicId: string; subscriptionId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient
    .deleteSubscription(body.topicId, body.subscriptionId);
};

export default new Map<string, ServiceBusServerFunc>([
  ['listSubscriptions', listSubscriptions],
  ['getSubscription', getSubscription],
  ['createSubscription', createSubscription],
  ['updateSubscription', updateSubscription],
  ['deleteSubscription', deleteSubscription],
]);
