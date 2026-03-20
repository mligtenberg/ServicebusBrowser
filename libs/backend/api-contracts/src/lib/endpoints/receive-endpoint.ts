import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusMessageChannels } from './message-channels';
import { ReceiveOptionsDescription } from './receive-options';

interface ReceiveEndpointBase {
  displayName: string;
  longDisplayName: string;
  receiveOptionsDescription: ReceiveOptionsDescription;
  clearable: boolean
}

export interface ServiceBusQueueReceiveEndpoint extends ReceiveEndpointBase {
  connectionId: UUID;
  queueName: string;
  channel: ServiceBusMessageChannels;
  target: 'serviceBus';
  type: 'queue';
}

export interface ServiceBusSubscriptionReceiveEndpoint
  extends ReceiveEndpointBase {
  connectionId: UUID;
  topicName: string;
  subscriptionName: string;
  channel: ServiceBusMessageChannels;
  target: 'serviceBus';
  type: 'subscription';
}

export interface RabbitMqQueueReceiveEndpoint extends ReceiveEndpointBase {
  connectionId: UUID;
  vhostName: string;
  queueName: string;
  target: 'rabbitmq';
  type: 'queue';
  queueType: 'classic' | 'quorum' | 'stream';
}

export type ReceiveEndpoint =
  | ServiceBusQueueReceiveEndpoint
  | ServiceBusSubscriptionReceiveEndpoint
  | RabbitMqQueueReceiveEndpoint;
