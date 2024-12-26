import { createAction, props } from '@ngrx/store';
import { Namespace, Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export const namespacesLoaded = createAction(
  '[Topology] Namespaces Loaded',
  props<{ namespaces: Namespace[] }>()
);

export const queuesLoaded = createAction(
  '[Topology] Queues Loaded',
  props<{ namespaceId: UUID; queues: Queue[] }>()
);

export const topicsLoaded = createAction(
  '[Topology] Topics Loaded',
  props<{ namespaceId: UUID; topics: Topic[] }>()
);

export const subscriptionsLoaded = createAction(
  '[Topology] Subscriptions Loaded',
  props<{ namespaceId: UUID; topicId: string; subscriptions: Subscription[] }>()
);
