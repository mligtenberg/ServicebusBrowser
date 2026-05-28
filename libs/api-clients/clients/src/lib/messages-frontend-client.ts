import {
  Message,
  ReceivedMessage,
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { BackendApi } from './backend-api';

export class MessagesFrontendClient {
  constructor(private backendApi: BackendApi) {}

  async retrieveMessages(
    endpoint: ReceiveEndpoint,
    options: {
      receiveMode: string;
      maxAmountOfMessagesToReceive?: number;
      [key: string]: string | number | undefined;
    },
    continuationToken?: string,
  ) {
    return (await this.backendApi.messagesDoRequest('retrieveMessages', {
      endpoint,
      options,
      continuationToken,
    })) as {messages: ReceivedMessage[], continuationToken: string};
  }

  async cancelSession(endpoint: ReceiveEndpoint, continuationToken: string) {
    await this.backendApi.messagesDoRequest('cancelSession', {
      endpoint,
      continuationToken,
    });
  }

  async clearMessages(endpoint: ReceiveEndpoint, continuationToken?: string) {
    return (await this.backendApi.messagesDoRequest('clearMessages', {
      endpoint,
      continuationToken,
    })) as { continuationToken?: string };
  }

  async sendMessage(endpoint: SendEndpoint, message: Message) {
    await this.backendApi.messagesDoRequest('sendMessage', {
      endpoint,
      message,
    });
  }

  async sendMessages(endpoint: SendEndpoint, messages: Message[]) {
    await this.backendApi.messagesDoRequest('sendMessages', {
      endpoint,
      messages,
    });
  }
}
