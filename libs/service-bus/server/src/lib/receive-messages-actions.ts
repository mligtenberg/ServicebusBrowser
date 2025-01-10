import { UUID } from '@service-bus-browser/shared-contracts';
import Long from 'long';
import { MessageChannels } from '@service-bus-browser/service-bus-contracts';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

export const peakFromQueue = (body: {
  connectionId: UUID,
  queueName: string,
  channel: MessageChannels,
  maxMessageCount: number,
  fromSequenceNumber?: string,
}, connectionManager: ConnectionManager) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ queueName: body.queueName, channel: body.channel });

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peakMessages(body.maxMessageCount, fromSequenceNumber);
}

export const peakFromSubscription = (body: {
  connectionId: UUID,
  topicName: string,
  subscriptionName: string,
  channel: MessageChannels,
  maxMessageCount: number,
  fromSequenceNumber?: string
}, connectionManager: ConnectionManager) => {
  const receiveClient = connectionManager
    .getConnectionClient({ id: body.connectionId })
    .getMessageReceiveClient({ topicName: body.topicName, subscriptionName: body.subscriptionName, channel: body.channel });

  const fromSequenceNumber = body.fromSequenceNumber ? Long.fromString(body.fromSequenceNumber) : undefined;
  return receiveClient.peakMessages(body.maxMessageCount, fromSequenceNumber);
}
