import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageChannels } from './message-channels';

export interface ServiceBusQueueReceiveEndpoint {
  connectionId: UUID;
  queueName: string;
  channel: MessageChannels;
}

export interface ServiceBusSubscriptionReceiveEndpoint {
  connectionId: UUID;
  topicName: string;
  subscriptionName: string;
  channel: MessageChannels;
}

export type ReceiveEndpoint =
  | ServiceBusQueueReceiveEndpoint
  | ServiceBusSubscriptionReceiveEndpoint;
