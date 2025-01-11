import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageChannels } from './message-channels';

export interface QueueReceiveEndpoint {
  connectionId: UUID;
  queueName: string;
  channel: MessageChannels;
}

export interface SubscriptionReceiveEndpoint {
  connectionId: UUID;
  topicName: string;
  subscriptionName: string;
  channel: MessageChannels;
}

export type ReceiveEndpoint = QueueReceiveEndpoint | SubscriptionReceiveEndpoint;
