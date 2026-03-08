import {
  ServiceBusMessage,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { ApiHandler } from './api-handler';

export class MessagesFrontendClient {
  constructor(private serviceBusApi: ApiHandler) {}

  async retrieveMessages(
    endpoint: ReceiveEndpoint,
    options: {
      receiveMode: string;
      maxAmountOfMessagesToReceive?: number;
      [key: string]: string | number | undefined;
    },
  ) {
    return (await this.serviceBusApi.messagesDoRequest('retrieveMessages', {
      endpoint,
      options,
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
}
