import {
  ReceiveEndpoint,
} from '@service-bus-browser/api-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';


const retrieveMessages: ServiceBusServerFunc = async (
  body: {
    endpoint: ReceiveEndpoint;
    options: {
      receiveMode: string;
      maxAmountOfMessagesToReceive?: number;
      [key: string]: string | number | undefined;
    };
  },
  connectionManager: ConnectionManager,
) => {
  const client = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesReader();

  if (client === undefined) {
    return [];
  }

  return await client.receiveMessages(body.endpoint, body.options);
};

export default new Map<string, ServiceBusServerFunc>([
  ['retrieveMessages', retrieveMessages],
]);
