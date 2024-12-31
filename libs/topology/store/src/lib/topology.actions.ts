import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Queue } from '@service-bus-browser/topology-contracts';

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

// TOPICS

export const loadTopics = createAction(
  '[Topology] Load Topics',
  props<{ namespaceId: UUID }>()
);

export const loadTopic = createAction(
  '[Topology] Load Topic',
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
