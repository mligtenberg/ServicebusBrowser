import {
  Connection,
  ConnectionValidator,
  MessagesReader,
  MessagesSender,
  TopologyProvider,
} from '@service-bus-browser/api-contracts';
import {
  RabbitMqConnectionValidator,
  RabbitMqMessagesReader,
  RabbitMqMessagesSender,
  RabbitMqTopologyProvider,
} from '@service-bus-browser/rabbitmq-backend-clients';
import {
  ServiceBusConnectionValidator,
  ServiceBusMessagesReader,
  ServiceBusMessagesSender,
  ServiceBusTopologyProvider,
} from '@service-bus-browser/service-bus-backend-clients';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getTopologyClient(): TopologyProvider | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusTopologyProvider(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqTopologyProvider(this.connection);
    }

    return undefined;
  }

  getMessagesReader(): MessagesReader | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesReader(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqMessagesReader(this.connection);
    }

    return undefined;
  }

  getMessagesSender(): MessagesSender | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesSender(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqMessagesSender(this.connection);
    }

    return undefined;
  }

  getConnectionValidator(): ConnectionValidator | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusConnectionValidator(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqConnectionValidator(this.connection);
    }

    return undefined;
  }
}
