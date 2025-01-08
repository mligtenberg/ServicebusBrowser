import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';

interface ElectronWindow {
  serviceBusApi: {
    messagesDoRequest: (requestType: string, request: unknown) => Promise<unknown>;
  };
}
const typelessWindow = window as unknown;
const { serviceBusApi } = typelessWindow as ElectronWindow;

export class ServiceBusManagementElectronClient {
  async peakFromQueue(connectionId: UUID,
                queueName: string,
                maxMessageCount: number,
                fromSequenceNumber?: bigint){
    return await serviceBusApi.messagesDoRequest('peakFromQueue', {
        connectionId,
        queueName,
        maxMessageCount,
        fromSequenceNumber
    }) as ServiceBusReceivedMessage[];
  }

async peakFromSubscription(connectionId: UUID,
                topicName: string,
                subscriptionName: string,
                maxMessageCount: number,
                fromSequenceNumber?: bigint){
    return await serviceBusApi.messagesDoRequest('peakFromSubscription', {
        connectionId,
        topicName,
        subscriptionName,
        maxMessageCount,
        fromSequenceNumber
    }) as ServiceBusReceivedMessage[];
  }
}
