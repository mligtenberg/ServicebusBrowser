import Long from 'long';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

const getReceiveClient = (receiveEndpoint: ReceiveEndpoint, connectionManager: ConnectionManager) => {
  const connectionId = receiveEndpoint.connectionId;
  const clientEndpoint = 'queueName' in receiveEndpoint
  ? { queueName: receiveEndpoint.queueName, channel: receiveEndpoint.channel }
  : { topicName: receiveEndpoint.topicName, subscriptionName: receiveEndpoint.subscriptionName, channel: receiveEndpoint.channel };

  return connectionManager
    .getConnectionClient({ id: connectionId })
    .getMessageReceiveClient(clientEndpoint);
}

export const peakMessages = (body: {
  endpoint: ReceiveEndpoint,
  maxMessageCount: number,
  fromSequenceNumber?: string,
}, connectionManager: ConnectionManager) => {
  const receiveClient = getReceiveClient(body.endpoint, connectionManager);

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peakMessages(body.maxMessageCount, fromSequenceNumber);
}

export const receiveMessages = (body: {
  endpoint: ReceiveEndpoint,
  maxMessageCount: number
}, connectionManager: ConnectionManager) => {
  const receiveClient = getReceiveClient(body.endpoint, connectionManager);

  return receiveClient.receiveMessages(body.maxMessageCount);
}
