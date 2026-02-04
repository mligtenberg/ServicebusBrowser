import {
  ServiceBusMessage,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import Long from 'long';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/service-bus-contracts';
import { ServiceBusApiHandler } from './service-bus-api-handler';

export class ServiceBusMessagesFrontendClient {
  constructor(private serviceBusApi: ServiceBusApiHandler) {}

  async peekMessages(
    endpoint: ReceiveEndpoint,
    maxMessageCount: number,
    fromSequenceNumber?: Long
  ) {
    return (await this.serviceBusApi.messagesDoRequest('peekMessages', {
      endpoint,
      maxMessageCount,
      fromSequenceNumber: fromSequenceNumber?.toString(),
    })) as ServiceBusReceivedMessage[];
  }

  async receiveMessages(endpoint: ReceiveEndpoint, maxMessageCount: number) {
    return (await this.serviceBusApi.messagesDoRequest('receiveMessages', {
      endpoint,
      maxMessageCount,
    })) as ServiceBusReceivedMessage[];
  }

  async sendMessage(endpoint: SendEndpoint, message: ServiceBusMessage) {
    await this.serviceBusApi.messagesDoRequest('sendMessage', {
      endpoint,
      message,
    });
  }

  async sendMessages(endpoint: SendEndpoint, messages: ServiceBusMessage[]) {
    await this.serviceBusApi.messagesDoRequest('sendMessages', {
      endpoint,
      messages,
    });
  }

  async saveFile(
    fileName: string,
    fileContent: Blob,
    fileTypes: Array<{ extensions: string[]; name: string }>
  ): Promise<boolean> {
    const buffer = await fileContent.bytes();
    console.log("buffer", buffer);

    return (await this.serviceBusApi.messagesDoRequest('storeFile', {
      fileName,
      buffer,
      fileTypes,
    })) as boolean;
  }
}
