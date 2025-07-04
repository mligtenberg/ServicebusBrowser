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
  async peekMessages(
    endpoint: ReceiveEndpoint,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await serviceBusApi.messagesDoRequest('peekMessages', {
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

  async sendMessages(
    endpoint: SendEndpoint,
    messages: ServiceBusMessage[]
  ) {
    await serviceBusApi.messagesDoRequest('sendMessages', {
      endpoint,
      messages
    });
  }

  async exportMessages(
    pageName: string,
    messages: ServiceBusReceivedMessage[]
  ): Promise<void> {
    await serviceBusApi.messagesDoRequest('exportMessages', {
      pageName,
      messages
    });
  }

  async importMessages(): Promise<{ pageName: string, messages: ServiceBusReceivedMessage[] }> {
    return await serviceBusApi.messagesDoRequest('importMessages', {}) as { pageName: string, messages: ServiceBusReceivedMessage[] };
  }


  async saveFile(fileName: string, fileContent: string, fileTypes: Array<{extensions: string[]; name: string;}>): Promise<boolean> {
    return await serviceBusApi.messagesDoRequest('storeFile', { fileName, fileContent, fileTypes }) as boolean;
  }

  async openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>): Promise<{fileName: string, fileContent: string} | undefined> {
    return await serviceBusApi.messagesDoRequest('openFile', { fileName, fileTypes }) as {fileName: string, fileContent: string} | undefined;
  }
}
