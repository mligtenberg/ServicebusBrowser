import {
  Connection,
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/message-queue-contracts';
import { AdministrationClient } from '../../../../message-queues/service-bus/clients/src/lib/internal/administration-client';
import { MessageReceiveClient } from '../../../../message-queues/service-bus/clients/src/lib/internal/message-receive-client';
import { MessageSendClient } from '../../../../message-queues/service-bus/clients/src/lib/internal/message-send-client';
import { ServiceBusTopologyProvider } from '../../../../message-queues/service-bus/clients/src/lib/service-bus-topology-provider';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getTopologyClient() {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusTopologyProvider(this.connection);
    }

    return undefined;
  }

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
