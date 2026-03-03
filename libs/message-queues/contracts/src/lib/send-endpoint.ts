import { UUID } from '@service-bus-browser/shared-contracts';

export interface ServiceBusQueueSendEndpoint {
  connectionId: UUID;
  queueName: string;
  endpoint: string;
  endpointDisplay: string;
}

export interface ServiceBusTopicSendEndpoint {
  connectionId: UUID;
  topicName: string;
  endpoint: string;
  endpointDisplay: string;
}

export type SendEndpoint = ServiceBusQueueSendEndpoint | ServiceBusTopicSendEndpoint;
