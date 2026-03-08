import {
  Connection,
  ConnectionValidator,
  MessagesReader,
  MessagesSender,
  TopologyProvider,
} from '@service-bus-browser/api-contracts';
import {
  ServiceBusConnectionValidator,
  ServiceBusManagementClient,
  ServiceBusMessagesReader,
  ServiceBusMessagesSender,
  ServiceBusTopologyProvider,
} from '@service-bus-browser/service-bus-clients';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getTopologyClient(): TopologyProvider | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusTopologyProvider(this.connection);
    }

    return undefined;
  }

  getMessagesReader(): MessagesReader | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesReader(this.connection);
    }

    return undefined;
  }

  getMessagesSender(): MessagesSender | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesSender(this.connection);
    }

    return undefined;
  }

  getConnectionValidator(): ConnectionValidator | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusConnectionValidator(this.connection);
    }

    return undefined;
  }
}
