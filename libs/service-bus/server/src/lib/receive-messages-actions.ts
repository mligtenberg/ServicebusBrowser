import { connectionManager } from './connection-manager-const';
import { UUID } from '@service-bus-browser/shared-contracts';
import Long from 'long';

export const peakFromQueue = (body: {
  connectionId: UUID,
  queueName: string,
  maxMessageCount: number,
  fromSequenceNumber?: string,
}) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ queueName: body.queueName });

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peakMessages(body.maxMessageCount, fromSequenceNumber);
}

export const peakFromSubscription = (body: {
  connectionId: UUID,
  topicName: string,
  subscriptionName: string,
  maxMessageCount: number,
  fromSequenceNumber?: string

}) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ topicName: body.topicName, subscriptionName: body.subscriptionName });

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peakMessages(body.maxMessageCount, fromSequenceNumber);
}
