import { Page } from '@service-bus-browser/shared-contracts';
import { MessageFilter } from './message-filter.model';

export type MessagePage = {
  retrievedAt: Date;
  loaded: boolean;
  filter?: MessageFilter;
  selectedMessageSequences?: string[];
  type: 'messages';
} & Page;
