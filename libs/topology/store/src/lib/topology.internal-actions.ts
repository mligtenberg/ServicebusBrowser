import { createAction, props } from '@ngrx/store';
import { Namespace, Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';
import { Problem } from '@service-bus-browser/shared-contracts';

export const namespacesLoaded = createAction(
  '[Topology] Namespaces Loaded',
  props<{ namespaces: Namespace[] }>()
);

export const failedToLoadNamespaces = createAction(
  '[Topology] Failed To Load Namespaces',
  props<{ error: Problem }>()
);

export const queuesLoaded = createAction(
  '[Topology] Queues Loaded',
  props<{ namespace: Namespace; queues: Queue[] }>()
);

export const failedToLoadQueues = createAction(
  '[Topology] Failed To Load Queues',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const topicsLoaded = createAction(
  '[Topology] Topics Loaded',
  props<{ namespace: Namespace; topics: Topic[] }>()
);

export const failedToLoadTopics = createAction(
  '[Topology] Failed To Load Topics',
  props<{ namespace?: Namespace; error: Problem }>()
);

export const subscriptionsLoaded = createAction(
  '[Topology] Subscriptions Loaded',
  props<{ namespace: Namespace; topic: Topic; subscriptions: Subscription[] }>()
);

export const failedToLoadSubscriptions = createAction(
  '[Topology] Failed To Load Subscriptions',
  props<{ namespace?: Namespace; topic?: Topic; error: Problem }>()
);
