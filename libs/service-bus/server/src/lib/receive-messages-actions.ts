import { connectionManager } from './connection-manager-const';
import { UUID } from '@service-bus-browser/shared-contracts';

export const peakFromQueue = (body: {
  connectionId: UUID,
  queueName: string,
  maxMessageCount: number,
  fromSequenceNumber?: bigint
}) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ queueName: body.queueName });

  return receiveClient.peakMessages(body.maxMessageCount, body.fromSequenceNumber);
}

export const peakFromSubscription = (body: {
  connectionId: UUID,
  topicName: string,
  subscriptionName: string,
  maxMessageCount: number,
  fromSequenceNumber?: bigint

}) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ topicName: body.topicName, subscriptionName: body.subscriptionName });

  return receiveClient.peakMessages(body.maxMessageCount, body.fromSequenceNumber);
}
