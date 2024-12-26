import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

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
