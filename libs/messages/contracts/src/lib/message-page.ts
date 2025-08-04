import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from './messages-contracts';
import { MessageFilter } from './message-filter.model';

export interface MessagePage {
  id: UUID;
  name: string;
  retrievedAt: Date;
  loaded: boolean;
  messages: ServiceBusReceivedMessage[],
  filter?: MessageFilter;
}
