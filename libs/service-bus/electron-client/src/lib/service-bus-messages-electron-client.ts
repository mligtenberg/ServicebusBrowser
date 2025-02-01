import { ServiceBusMessage, ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import Long from 'long';
import { ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';

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
  async peakMessages(
    endpoint: ReceiveEndpoint,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peakMessages', {
      endpoint,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }

  async receiveMessages(
    endpoint: ReceiveEndpoint,
    maxMessageCount: number,
  ) {
    return (await serviceBusApi.messagesDoRequest('receiveMessages', {
      endpoint,
      maxMessageCount
    })) as ServiceBusReceivedMessage[];
  }

  async sendMessage(
    endpoint: SendEndpoint,
    message: ServiceBusMessage
  ) {
    await serviceBusApi.messagesDoRequest('sendMessage', {
      endpoint,
      message
    });
  }
}
