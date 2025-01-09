import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import Long from 'long';
import { MessageChannels } from '@service-bus-browser/service-bus-contracts';

interface ElectronWindow {
  serviceBusApi: {
    messagesDoRequest: (
      requestType: string,
      request: unknown
    ) => Promise<unknown>;
  };
}

const typelessWindow = window as unknown;
const { serviceBusApi } = typelessWindow as ElectronWindow;

export class ServiceBusMessagesElectronClient {
  async peakFromQueue(
    connectionId: UUID,
    queueName: string,
    channel: MessageChannels,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peakFromQueue', {
      connectionId,
      queueName,
      channel,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }

  async peakFromSubscription(
    connectionId: UUID,
    topicName: string,
    subscriptionName: string,
    channel: MessageChannels,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peakFromSubscription', {
      connectionId,
      topicName,
      subscriptionName,
      channel,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }
}
