import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Queue, Subscription, SubscriptionRule, Topic } from '@service-bus-browser/topology-contracts';

// NAMESPACES

export const loadNamespaces = createAction(
  '[Topology] Load Namespaces'
);

// QUEUES

export const loadQueues = createAction(
  '[Topology] Load Queues',
  props<{ namespaceId: UUID }>()
);

export const loadQueue = createAction(
  '[Topology] Load Queue',
  props<{ namespaceId: UUID; queueId: string }>()
);

export const addQueue = createAction(
  '[Topology] Add Queue',
  props<{ namespaceId: UUID; queue: Queue }>()
);

export const editQueue = createAction(
  '[Topology] Edit Queue',
  props<{ namespaceId: UUID; queue: Queue }>()
);

export const removeQueue = createAction(
  '[Topology] Remove Queue',
  props<{ namespaceId: UUID; queueId: string }>()
);

// TOPICS

export const loadTopics = createAction(
  '[Topology] Load Topics',
  props<{ namespaceId: UUID }>()
);

export const loadTopic = createAction(
  '[Topology] Load Topic',
  props<{ namespaceId: UUID; topicId: string }>()
);

export const addTopic = createAction(
  '[Topology] Add Topic',
  props<{ namespaceId: UUID; topic: Topic }>()
);

export const editTopic = createAction(
  '[Topology] Edit Topic',
  props<{ namespaceId: UUID; topic: Topic }>()
);

export const removeTopic = createAction(
  '[Topology] Remove Topic',
  props<{ namespaceId: UUID; topicId: string }>()
);

// SUBSCRIPTIONS

export const loadSubscriptions = createAction(
  '[Topology] Load Subscriptions',
  props<{ namespaceId: UUID; topicId: string }>()
);

export const loadSubscription = createAction(
  '[Topology] Load Subscription',
  props<{ namespaceId: UUID; topicId: string; subscriptionId: string }>()
);

export const addSubscription = createAction(
  '[Topology] Add Subscription',
  props<{ namespaceId: UUID; topicId: string; subscription: Subscription }>()
);

export const editSubscription = createAction(
  '[Topology] Edit Subscription',
  props<{ namespaceId: UUID; topicId: string; subscription: Subscription }>()
);

export const removeSubscription = createAction(
  '[Topology] Remove Subscription',
  props<{ namespaceId: UUID; topicId: string; subscriptionId: string }>()
);

// subscription rules
export const addSubscriptionRule = createAction(
  '[Topology] Add Subscription Rule',
  props<{ namespaceId: UUID; topicId: string; subscriptionId: string; rule: SubscriptionRule }>()
);

export const editSubscriptionRule = createAction(
  '[Topology] Edit Subscription Rule',
  props<{ namespaceId: UUID; topicId: string; subscriptionId: string; rule: SubscriptionRule }>()
);

export const removeSubscriptionRule = createAction(
  '[Topology] Remove Subscription Rule',
  props<{ namespaceId: UUID; topicId: string; subscriptionId: string; ruleName: string }>()
);
