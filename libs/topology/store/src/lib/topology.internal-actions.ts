import { createAction, props } from '@ngrx/store';
import {
  Namespace,
  Queue,
  QueueWithMetaData, Subscription,
  SubscriptionWithMetaData,
  Topic,
  TopicWithMetaData
} from '@service-bus-browser/topology-contracts';
import { Problem } from '@service-bus-browser/shared-contracts';

// NAMESPACES

export const namespacesLoaded = createAction(
  '[Topology] Namespaces Loaded',
  props<{ namespaces: Namespace[] }>()
);

export const failedToLoadNamespaces = createAction(
  '[Topology] Failed To Load Namespaces',
  props<{ error: Problem }>()
);

// QUEUES

export const queuesLoaded = createAction(
  '[Topology] Queues Loaded',
  props<{ namespace: Namespace; queues: QueueWithMetaData[] }>()
);

export const failedToLoadQueues = createAction(
  '[Topology] Failed To Load Queues',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const queueLoaded = createAction(
  '[Topology] Queue Loaded',
  props<{ namespace: Namespace; queue: QueueWithMetaData }>()
);

export const failedToLoadQueue = createAction(
  '[Topology] Failed To Load Queue',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const queueAdded = createAction(
  '[Topology] Queue Added',
  props<{ namespace: Namespace; queue: Queue }>()
);

export const failedToAddQueue = createAction(
  '[Topology] Failed To Add Queue',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const queueEdited = createAction(
  '[Topology] Queue Edited',
  props<{ namespace: Namespace; queue: Queue }>()
);

export const failedToEditQueue = createAction(
  '[Topology] Failed To Edit Queue',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const queueRemoved = createAction(
  '[Topology] Queue Removed',
  props<{ namespace: Namespace; queueId: string }>()
);

export const failedToRemoveQueue = createAction(
  '[Topology] Failed To Remove Queue',
  props<{ namespace?: Namespace; error: Problem }>()
);

// TOPICS

export const topicsLoaded = createAction(
  '[Topology] Topics Loaded',
  props<{ namespace: Namespace; topics: TopicWithMetaData[] }>()
);

export const failedToLoadTopics = createAction(
  '[Topology] Failed To Load Topics',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const topicLoaded = createAction(
  '[Topology] Topic Loaded',
  props<{ namespace: Namespace; topic: TopicWithMetaData }>()
);

export const failedToLoadTopic = createAction(
  '[Topology] Failed To Load Topic',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const topicAdded = createAction(
  '[Topology] Topic Added',
  props<{ namespace: Namespace; topic: Topic }>()
);

export const failedToAddTopic = createAction(
  '[Topology] Failed To Add Topic',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const topicEdited = createAction(
  '[Topology] Topic Edited',
  props<{ namespace: Namespace; topic: Topic }>()
);

export const failedToEditTopic = createAction(
  '[Topology] Failed To Edit Topic',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const topicRemoved = createAction(
  '[Topology] Topic Removed',
  props<{ namespace: Namespace; topicId: string }>()
);

export const failedToRemoveTopic = createAction(
  '[Topology] Failed To Remove Topic',
  props<{ namespace?: Namespace; error: Problem }>()
);

// SUBSCRIPTIONS

export const subscriptionsLoaded = createAction(
  '[Topology] Subscriptions Loaded',
  props<{ namespace: Namespace; topic: TopicWithMetaData; subscriptions: SubscriptionWithMetaData[] }>()
);

export const failedToLoadSubscriptions = createAction(
  '[Topology] Failed To Load Subscriptions',
  props<{ namespace?: Namespace; topic?: TopicWithMetaData; error: Problem }>()
);

export const subscriptionLoaded = createAction(
  '[Topology] Subscription Loaded',
  props<{ namespace: Namespace; topic: TopicWithMetaData; subscription: SubscriptionWithMetaData }>()
);

export const failedToLoadSubscription = createAction(
  '[Topology] Failed To Load Subscription',
  props<{ namespace?: Namespace; topic?: TopicWithMetaData; error: Problem }>()
);

export const subscriptionAdded = createAction(
  '[Topology] Subscription Added',
  props<{ namespace: Namespace; topic: TopicWithMetaData; subscription: Subscription }>()
);

export const failedToAddSubscription = createAction(
  '[Topology] Failed To Add Subscription',
  props<{ namespace?: Namespace; topic?: TopicWithMetaData; error: Problem }>()
);

export const subscriptionEdited = createAction(
  '[Topology] Subscription Edited',
  props<{ namespace: Namespace; topic: TopicWithMetaData; subscription: Subscription }>()
);

export const failedToEditSubscription = createAction(
  '[Topology] Failed To Edit Subscription',
  props<{ namespace?: Namespace; topic?: TopicWithMetaData; error: Problem }>()
);

export const subscriptionRemoved = createAction(
  '[Topology] Subscription Removed',
  props<{ namespace: Namespace; topic: TopicWithMetaData; subscriptionId: string }>()
);

export const failedToRemoveSubscription = createAction(
  '[Topology] Failed To Remove Subscription',
  props<{ namespace?: Namespace; topic?: TopicWithMetaData; error: Problem }>()
);
