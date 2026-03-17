import { Message, SendEndpoint } from '@service-bus-browser/api-contracts';
import { ConnectionManager } from '../clients/connection-manager';
import { ServiceBusServerFunc } from '../types';

const sendMessage = async (
  body: {
    endpoint: SendEndpoint;
    message: Message;
  },
  connectionManager: ConnectionManager,
) => {
  const sender = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesSender();

  if (sender === undefined) {
    throw new Error(`No messages sender found for connection: ${body.endpoint.connectionId}`);
  }

  return await sender.send(body.endpoint, body.message);
};

const sendMessages = async (
  body: {
    endpoint: SendEndpoint;
    messages: Message[];
  },
  connectionManager: ConnectionManager,
) => {
  const sender = connectionManager
    .getConnectionClient({ id: body.endpoint.connectionId })
    .getMessagesSender();

  if (sender === undefined) {
    return;
  }

  return await sender.sendBatch(body.endpoint, body.messages);
};

export default new Map<string, ServiceBusServerFunc>([
  ['sendMessage', sendMessage],
  ['sendMessages', sendMessages],
]);
