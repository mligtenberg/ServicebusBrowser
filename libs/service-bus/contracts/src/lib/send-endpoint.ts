import { UUID } from '@service-bus-browser/shared-contracts';

export interface QueueSendEndpoint {
  connectionId: UUID;
  queueName: string;
  endpoint: string;
}

export interface TopicSendEndpoint {
  connectionId: UUID;
  topicName: string;
  endpoint: string;
}

export type SendEndpoint = QueueSendEndpoint | TopicSendEndpoint;
