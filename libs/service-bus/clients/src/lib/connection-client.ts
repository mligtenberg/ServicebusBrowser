import { Connection, ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { AdministrationClient } from './administration-client';
import { MessageReceiveClient } from './message-receive-client';
import { MessageSendClient } from './message-send-client';
import { getCredential, ServiceBusCredential } from './credential-helper';

export class ConnectionClient {

  private readonly serviceBusCredential: ServiceBusCredential = getCredential(this.connection);
  constructor(private connection: Connection) {}

  getAdministrationClient() {
    return new AdministrationClient(this.serviceBusCredential);
  }

  getMessageReceiveClient(endpoint: ReceiveEndpoint) {
    return new MessageReceiveClient(this.serviceBusCredential, endpoint);
  }

  getMessageSendClient(endpoint: SendEndpoint) {
    return new MessageSendClient(this.serviceBusCredential, endpoint);
  }
}
