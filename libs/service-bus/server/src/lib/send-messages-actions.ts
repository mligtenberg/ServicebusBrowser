import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusMessage } from '@service-bus-browser/messages-contracts';
import { ServiceBusServerFunc } from './types';

const getSendClient = (sendEndpoint: SendEndpoint, connectionManager: ConnectionManager) => {
  const connectionId = sendEndpoint.connectionId;

  return connectionManager
    .getConnectionClient({ id: connectionId })
    .getMessageSendClient(sendEndpoint);
}

const sendMessage = (body: {
  endpoint: SendEndpoint,
  message: ServiceBusMessage,
}, connectionManager: ConnectionManager) => {
  const sendClient = getSendClient(body.endpoint, connectionManager);

  return sendClient.send(body.message);
}

const sendMessages = (body: {
  endpoint: SendEndpoint,
  messages: ServiceBusMessage[],
}, connectionManager: ConnectionManager)=> {
  const sendClient = getSendClient(body.endpoint, connectionManager);
  return sendClient.send(body.messages);
}

export default new Map<string, ServiceBusServerFunc>([
  ['sendMessage', sendMessage],
  ['sendMessages', sendMessages],
]);
