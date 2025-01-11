import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageChannels } from './message-channels';

interface QueueReceiveEndpoint {
  connectionId: UUID;
  queueName: string;
  channel: MessageChannels;
}

interface SubscriptionReceiveEndpoint {
  connectionId: UUID;
  topicName: string;
  subscriptionName: string;
  channel: MessageChannels;
}

export type ReceiveEndpoint = QueueReceiveEndpoint | SubscriptionReceiveEndpoint;
