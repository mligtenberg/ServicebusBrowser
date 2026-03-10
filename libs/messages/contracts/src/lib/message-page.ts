import { Page } from '@service-bus-browser/shared-contracts';
import { MessageFilter } from '../../../filtering/src/lib/message-filter.model';

export type MessagePage = {
  retrievedAt: Date;
  loaded: boolean;
  filter?: MessageFilter;
  type: 'messages';
} & Page;
