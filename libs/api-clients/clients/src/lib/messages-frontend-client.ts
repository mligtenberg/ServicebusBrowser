import {
  Message,
  ReceivedMessage,
  ReceiveEndpoint,
  ReceiveOptionsDescription,
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
    continuationToken?: string,
  ) {
    return (await this.serviceBusApi.messagesDoRequest('retrieveMessages', {
      endpoint,
      options,
      continuationToken,
    })) as {messages: ReceivedMessage[], continuationToken: string};
  }

  async getReceiveEndpointOptionsModel(endpoint: ReceiveEndpoint) {
    return (await this.serviceBusApi.messagesDoRequest('getReceiveEndpointOptionsModel', {
      endpoint,
    })) as ReceiveOptionsDescription;
  }

  async sendMessage(endpoint: SendEndpoint, message: Message) {
    await this.serviceBusApi.messagesDoRequest('sendMessage', {
      endpoint,
      message,
    });
  }

  async sendMessages(endpoint: SendEndpoint, messages: Message[]) {
    await this.serviceBusApi.messagesDoRequest('sendMessages', {
      endpoint,
      messages,
    });
  }
}
