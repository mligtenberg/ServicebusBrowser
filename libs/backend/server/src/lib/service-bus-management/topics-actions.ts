import { UUID } from '@service-bus-browser/shared-contracts';
import { Topic } from '@service-bus-browser/service-bus-api-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { getManagementClient } from './get-management-client';

const listTopics = async (
  body: { connectionId: UUID },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.getTopics();
};

const getTopic = async (
  body: { connectionId: UUID; topicId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.getTopic(body.topicId);
};

const createTopic = async (
  body: { connectionId: UUID; topic: Topic },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.addTopic(body.topic);
};

const updateTopic = async (
  body: { connectionId: UUID; topic: Topic },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.updateTopic(body.topic);
};

const deleteTopic = async (
  body: { connectionId: UUID; topicId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.deleteTopic(body.topicId);
};

export default new Map<string, ServiceBusServerFunc>([
  ['listTopics', listTopics],
  ['getTopic', getTopic],
  ['createTopic', createTopic],
  ['updateTopic', updateTopic],
  ['deleteTopic', deleteTopic],
]);
