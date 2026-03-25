import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { getRabbitMqManagementClient } from './get-rabbitmq-management-client';

const getQueue = async (
  body: { connectionId: UUID; vhostName: string; queueName: string },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  return client.getQueueByVHost(body.vhostName, body.queueName);
};

const createQueue = async (
  body: {
    connectionId: UUID;
    vhostName: string;
    queueName: string;
    durable: boolean;
    autoDelete: boolean;
    queueType: 'classic' | 'quorum' | 'stream';
  },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  await client.createQueueFull(
    body.vhostName,
    body.queueName,
    body.durable,
    body.autoDelete,
    body.queueType,
  );
  return null;
};

const deleteQueue = async (
  body: { connectionId: UUID; vhostName: string; queueName: string },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  await client.deleteQueue(body.vhostName, body.queueName);
  return null;
};

export default new Map<string, ServiceBusServerFunc>([
  ['getQueue', getQueue],
  ['createQueue', createQueue],
  ['deleteQueue', deleteQueue],
]);
