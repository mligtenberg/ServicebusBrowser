import { UUID } from '@service-bus-browser/shared-contracts';

export interface QueueSendEndpoint {
  connectionId: UUID;
  queueName: string;
  endpoint: string;
  endpointDisplay: string;
}

export interface TopicSendEndpoint {
  connectionId: UUID;
  topicName: string;
  endpoint: string;
  endpointDisplay: string;
}

export type SendEndpoint = QueueSendEndpoint | TopicSendEndpoint;
