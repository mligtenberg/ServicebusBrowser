import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Queue } from '@service-bus-browser/topology-contracts';

export const loadNamespaces = createAction(
  '[Topology] Load Namespaces'
);

export const loadQueues = createAction(
  '[Topology] Load Queues',
  props<{ namespaceId: UUID }>()
);

export const loadTopics = createAction(
  '[Topology] Load Topics',
  props<{ namespaceId: UUID }>()
);

export const loadSubscriptions = createAction(
  '[Topology] Load Subscriptions',
  props<{ namespaceId: UUID; topicId: string }>()
);

export const addQueue = createAction(
  '[Topology] Add Queue',
  props<{ namespaceId: UUID; queue: Queue }>()
);
