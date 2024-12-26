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
  on(internalActions.queuesLoaded, (state, { namespace, queues }) => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: queues,
    },
  })),
  on(internalActions.topicsLoaded, (state, { namespace, topics }) => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespace.id]: topics,
    },
  })),
  on(
    internalActions.subscriptionsLoaded,
    (state, { namespace, topic, subscriptions }) => ({
      ...state,
      subscriptionsPerNamespaceAndTopic: {
        ...state.subscriptionsPerNamespaceAndTopic,
        [namespace.id]: {
          ...state.subscriptionsPerNamespaceAndTopic[namespace.id],
          [topic.id]: subscriptions,
        },
      },
    })
  ),
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer,
});
