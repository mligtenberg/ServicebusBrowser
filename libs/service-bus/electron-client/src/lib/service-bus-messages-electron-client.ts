import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import Long from 'long';

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
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peakFromQueue', {
      connectionId,
      queueName,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }

  async peakFromSubscription(
    connectionId: UUID,
    topicName: string,
    subscriptionName: string,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peakFromSubscription', {
      connectionId,
      topicName,
      subscriptionName,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }
}
