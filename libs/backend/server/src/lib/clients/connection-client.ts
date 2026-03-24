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
  topologyProvider: TopologyProvider | undefined;
  messagesReader: MessagesReader | undefined;
  messagesSender: MessagesSender | undefined;
  connectionValidator: ConnectionValidator | undefined;

  constructor(private connection: Connection) {
    this.topologyProvider = this._getTopologyClient();
    this.messagesReader = this._getMessagesReader();
    this.messagesSender = this._getMessagesSender();
    this.connectionValidator = this._getConnectionValidator();
  }

  getTopologyClient(): TopologyProvider | undefined {
    return this.topologyProvider;
  }
  getMessagesReader(): MessagesReader | undefined {
    return this.messagesReader;
  }
  getMessagesSender(): MessagesSender | undefined {
    return this.messagesSender;
  }
  getConnectionValidator(): ConnectionValidator | undefined {
    return this.connectionValidator;
  }

  private _getTopologyClient(): TopologyProvider | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusTopologyProvider(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqTopologyProvider(this.connection);
    }

    return undefined;
  }

  private _getMessagesReader(): MessagesReader | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesReader(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqMessagesReader(this.connection);
    }

    return undefined;
  }

  private _getMessagesSender(): MessagesSender | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusMessagesSender(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqMessagesSender(this.connection);
    }

    return undefined;
  }

  private _getConnectionValidator(): ConnectionValidator | undefined {
    if (this.connection.target === 'serviceBus') {
      return new ServiceBusConnectionValidator(this.connection);
    }

    if (this.connection.target === 'rabbitmq') {
      return new RabbitMqConnectionValidator(this.connection);
    }

    return undefined;
  }
}
