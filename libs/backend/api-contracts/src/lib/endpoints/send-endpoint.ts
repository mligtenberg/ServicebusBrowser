import { UUID } from '@service-bus-browser/shared-contracts';

interface SendEndpointBase {
  displayName: string;
  supportedMessageAnnotations: {
    key: string;
    description?: string;
    displayType: 'string' | 'date' | 'number';
  }[]
}

export interface ServiceBusQueueSendEndpoint extends SendEndpointBase {
  connectionId: UUID;
  queueName: string;
  endpoint: string;
  endpointDisplay: string;
  target: 'serviceBus';
  type: 'queue';
}

export interface ServiceBusTopicSendEndpoint extends SendEndpointBase {
  connectionId: UUID;
  topicName: string;
  endpoint: string;
  endpointDisplay: string;
  target: 'serviceBus';
  type: 'topic';
}

export interface RabbitMqQueueSendEndpoint extends SendEndpointBase {
  connectionId: UUID;
  vhostName: string;
  queueName: string;
  endpoint: string;
  endpointDisplay: string;
  target: 'rabbitmq';
  type: 'queue';
}

export interface RabbitMqExchangeSendEndpoint extends SendEndpointBase {
  connectionId: UUID;
  vhostName: string;
  exchangeName: string;
  endpoint: string;
  endpointDisplay: string;
  target: 'rabbitmq';
  type: 'exchange';
}

export type SendEndpoint =
  | ServiceBusQueueSendEndpoint
  | ServiceBusTopicSendEndpoint
  | RabbitMqQueueSendEndpoint
  | RabbitMqExchangeSendEndpoint;
