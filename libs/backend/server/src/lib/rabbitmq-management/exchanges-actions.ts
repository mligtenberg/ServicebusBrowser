import { UUID } from '@service-bus-browser/shared-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';
import { getRabbitMqManagementClient } from './get-rabbitmq-management-client';

const getExchange = async (
  body: { connectionId: UUID; vhostName: string; exchangeName: string },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  const exchanges = await client.getExchangesByVHost(body.vhostName);
  const exchange = exchanges.find((e) => e.name === body.exchangeName);
  if (!exchange) {
    throw new Error(`Exchange '${body.exchangeName}' not found in vhost '${body.vhostName}'`);
  }
  return exchange;
};

const createExchange = async (
  body: {
    connectionId: UUID;
    vhostName: string;
    exchangeName: string;
    type: string;
    durable: boolean;
    autoDelete: boolean;
    internal: boolean;
  },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  await client.createExchangeFull(
    body.vhostName,
    body.exchangeName,
    body.type,
    body.durable,
    body.autoDelete,
    body.internal,
  );
  return null;
};

const deleteExchange = async (
  body: { connectionId: UUID; vhostName: string; exchangeName: string },
  connectionManager: ConnectionManager,
) => {
  const client = getRabbitMqManagementClient(body.connectionId, connectionManager);
  await client.deleteExchange(body.vhostName, body.exchangeName);
  return null;
};

export default new Map<string, ServiceBusServerFunc>([
  ['getExchange', getExchange],
  ['createExchange', createExchange],
  ['deleteExchange', deleteExchange],
]);
