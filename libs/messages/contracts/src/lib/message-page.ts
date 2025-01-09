import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from './messages-contracts';

export interface MessagePage {
  id: UUID;
  name: string;
  retrievedAt: Date;
  loaded: boolean;
  messages: ServiceBusReceivedMessage[]
}
