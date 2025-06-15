import Long from 'long';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

const getReceiveClient = (receiveEndpoint: ReceiveEndpoint, connectionManager: ConnectionManager) => {
  const connectionId = receiveEndpoint.connectionId;

  return connectionManager
    .getConnectionClient({ id: connectionId })
    .getMessageReceiveClient(receiveEndpoint);
}

export const peekMessages = (body: {
  endpoint: ReceiveEndpoint,
  maxMessageCount: number,
  fromSequenceNumber?: string,
}, connectionManager: ConnectionManager) => {
  const receiveClient = getReceiveClient(body.endpoint, connectionManager);

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peekMessages(body.maxMessageCount, fromSequenceNumber);
}

export const receiveMessages = (body: {
  endpoint: ReceiveEndpoint,
  maxMessageCount: number
}, connectionManager: ConnectionManager) => {
  const receiveClient = getReceiveClient(body.endpoint, connectionManager);

  return receiveClient.receiveMessages(body.maxMessageCount);
}
