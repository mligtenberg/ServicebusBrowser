import { UUID } from '@service-bus-browser/shared-contracts';
import { QueueWithMetaData } from '@service-bus-browser/service-bus-api-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { getManagementClient } from './get-management-client';

const listQueues = async (
  body: { connectionId: UUID },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager
  );
  return managementClient.getQueues();
};

const getQueue = async (
  body: { connectionId: UUID; queueId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.getQueue(body.queueId);
};

const addQueue = async (
  body: { connectionId: UUID; queue: QueueWithMetaData },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return managementClient.addQueue(body.queue);
};

const editQueue = async (
  body: { connectionId: UUID; queue: QueueWithMetaData },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.updateQueue(body.queue);
};

const removeQueue = async (
  body: { connectionId: UUID; queueId: string },
  connectionManager: ConnectionManager,
) => {
  const managementClient = getManagementClient(
    body.connectionId,
    connectionManager,
  );
  return await managementClient.deleteQueue(body.queueId);
};

export default new Map<string, ServiceBusServerFunc>([
  ['listQueues', listQueues],
  ['getQueue', getQueue],
  ['addQueue', addQueue],
  ['editQueue', editQueue],
  ['removeQueue', removeQueue],
]);
