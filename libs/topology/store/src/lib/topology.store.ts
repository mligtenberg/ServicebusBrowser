import { createFeature, createReducer, on } from '@ngrx/store';
import {
  Namespace,
  Queue,
  Subscription,
  Topic,
} from '@service-bus-browser/topology-contracts';

import * as internalActions from './topology.internal-actions';

export const featureKey = 'topology';

export type TopologyState = {
  namespaces: Namespace[];
  queuesPerNamespace: Record<string, Queue[]>;
  topicsPerNamespace: Record<string, Topic[]>;
  subscriptionsPerNamespaceAndTopic: Record<
    string,
    Record<string, Subscription[]>
  >;
};

export const initialState: TopologyState = {
  namespaces: [],
  queuesPerNamespace: {},
  topicsPerNamespace: {},
  subscriptionsPerNamespaceAndTopic: {},
};

export const logsReducer = createReducer(
  initialState,
  on(internalActions.namespacesLoaded, (state, { namespaces }) => ({
    ...state,
    namespaces,
  })),
  on(internalActions.queuesLoaded, (state, { namespaceId, queues }) => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespaceId]: queues,
    },
  })),
  on(internalActions.topicsLoaded, (state, { namespaceId, topics }) => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespaceId]: topics,
    },
  })),
  on(
    internalActions.subscriptionsLoaded,
    (state, { namespaceId, topicId, subscriptions }) => ({
      ...state,
      subscriptionsPerNamespaceAndTopic: {
        ...state.subscriptionsPerNamespaceAndTopic,
        [namespaceId]: {
          ...state.subscriptionsPerNamespaceAndTopic[namespaceId],
          [topicId]: subscriptions,
        },
      },
    })
  ),
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer,
});
