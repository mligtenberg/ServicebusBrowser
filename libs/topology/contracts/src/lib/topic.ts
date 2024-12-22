import { Subscription } from './subscription';

export type Topic = {
  id: string;
  name: string;
}

export type TopicWithChildren<TSubscription extends Subscription = Subscription> = Topic & {
  subscriptions: TSubscription[];
}
