import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageFilter } from './message-filter.model';

export interface MessagePage {
  id: UUID;
  name: string;
  retrievedAt: Date;
  loaded: boolean;
  filter?: MessageFilter;
  selectedMessageSequences?: string[];
}
