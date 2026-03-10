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

export default new Map<string, ServiceBusServerFunc>([
  ['retrieveMessages', retrieveMessages],
]);
