import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusMessageChannels } from './message-channels';
import { MessageQueueTargetType } from './message-queue-types';

interface ReceiveEndpointBase {
  displayName: string;
}

export interface ServiceBusQueueReceiveEndpoint extends ReceiveEndpointBase {
  connectionId: UUID;
  queueName: string;
  channel: ServiceBusMessageChannels;
  target: MessageQueueTargetType;
}

export interface ServiceBusSubscriptionReceiveEndpoint extends ReceiveEndpointBase {
  connectionId: UUID;
  topicName: string;
  subscriptionName: string;
  channel: ServiceBusMessageChannels;
  target: MessageQueueTargetType;
}

export type ReceiveEndpoint =
  | ServiceBusQueueReceiveEndpoint
  | ServiceBusSubscriptionReceiveEndpoint;
