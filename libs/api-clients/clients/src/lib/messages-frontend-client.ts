import {
  Message,
  ReceivedMessage,
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
    continuationToken?: string,
  ) {
    return (await this.serviceBusApi.messagesDoRequest('retrieveMessages', {
      endpoint,
      options,
      continuationToken,
    })) as {messages: ReceivedMessage[], continuationToken: string};
  }

  async clearMessages(endpoint: ReceiveEndpoint) {
    await this.serviceBusApi.messagesDoRequest('clearMessages', {
      endpoint,
    });
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
