import {
  ReceiveEndpoint,
  ReceiveOptions,
} from '@service-bus-browser/api-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';


const retrieveMessages: ServiceBusServerFunc = async (
  body: {
    endpoint: ReceiveEndpoint;
    options: ReceiveOptions;
    continuationToken?: string;
  },
  connectionManager: ConnectionManager,
) => {
  const client = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesReader();

  if (client === undefined) {
    return [];
  }

  return await client.receiveMessages(body.endpoint, body.options, body.continuationToken);
};

async function clearMessages(body: { endpoint: ReceiveEndpoint, continuationToken: string | undefined }, connectionManager: ConnectionManager) {
  const client = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesReader();

  if (client === undefined) {
    throw new Error(`No messages reader found for connection: ${body.endpoint.connectionId}`);
  }

  return await client.clear(body.endpoint, body.continuationToken);
}

async function cancelSession(body: { endpoint: ReceiveEndpoint; continuationToken: string }, connectionManager: ConnectionManager) {
  const client = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesReader();

  if (client === undefined) {
    return {};
  }

  await client.cancelSession(body.endpoint, body.continuationToken);
  return {};
}

export default new Map<string, ServiceBusServerFunc>([
  ['retrieveMessages', retrieveMessages],
  ['clearMessages', clearMessages],
  ['cancelSession', cancelSession],
]);
