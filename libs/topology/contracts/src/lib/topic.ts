import { Subscription } from './subscription';
import { UUID } from '@service-bus-browser/shared-contracts';

export type Topic = {
  namespaceId: UUID;
  endpoint: string;
  id: string;
  name: string;
}

export type TopicWithChildren<TSubscription extends Subscription = Subscription> = Topic & {
  subscriptions: TSubscription[];
}
