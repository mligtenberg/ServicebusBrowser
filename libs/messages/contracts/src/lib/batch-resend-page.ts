import { UUID } from '@service-bus-browser/shared-contracts';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusMessage, ServiceBusReceivedMessage } from './messages-contracts';
import { Action } from './batch-actions.model';

export interface BatchResendPage {
  id: UUID;
  name: string;
  messages: ServiceBusReceivedMessage[];
  actions: Action[];
  selectedEndpoint: SendEndpoint | null;
}
