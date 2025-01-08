import { Connection } from '@service-bus-browser/service-bus-contracts';
import { AdministrationClient } from './administration-client';
import { MessageReceiveClient } from './message-receive-client';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getAdministrationClient() {
    return new AdministrationClient(this.connection);
  }

  getMessageReceiveClient(endpoint: { queueName: string; } | { topicName: string; subscriptionName: string; }) {
    return new MessageReceiveClient(this.connection, endpoint);
  }
}
