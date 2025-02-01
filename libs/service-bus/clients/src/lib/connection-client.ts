import { Connection, ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { AdministrationClient } from './administration-client';
import { MessageReceiveClient } from './message-receive-client';
import { MessageSendClient } from './message-send-client';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getAdministrationClient() {
    return new AdministrationClient(this.connection);
  }

  getMessageReceiveClient(endpoint: ReceiveEndpoint) {
    return new MessageReceiveClient(this.connection, endpoint);
  }

  getMessageSendClient(endpoint: SendEndpoint) {
    return new MessageSendClient(this.connection, endpoint);
  }
}
