import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ServiceBusMessage } from '@service-bus-browser/messages-contracts';

const getSendClient = (sendEndpoint: SendEndpoint, connectionManager: ConnectionManager) => {
  const connectionId = sendEndpoint.connectionId;

  return connectionManager
    .getConnectionClient({ id: connectionId })
    .getMessageSendClient(sendEndpoint);
}

export const sendMessage = (body: {
  endpoint: SendEndpoint,
  message: ServiceBusMessage,
}, connectionManager: ConnectionManager) => {
  const sendClient = getSendClient(body.endpoint, connectionManager);

  return sendClient.send(body.message);
}
