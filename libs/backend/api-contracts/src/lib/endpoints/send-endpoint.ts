import { UUID } from '@service-bus-browser/shared-contracts';

interface SendEndpointBase {
  displayName: string;
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
  queueName: string;
  endpoint: string;
  endpointDisplay: string;
  target: 'rabbitmq';
  type: 'queue';
}

export type SendEndpoint =
  | ServiceBusQueueSendEndpoint
  | ServiceBusTopicSendEndpoint
  | RabbitMqQueueSendEndpoint;
