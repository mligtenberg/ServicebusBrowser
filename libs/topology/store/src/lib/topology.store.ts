import { createFeature, createReducer, on } from '@ngrx/store';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionWithMetaData,
  TopicWithMetaData,
} from '@service-bus-browser/topology-contracts';

import * as internalActions from './topology.internal-actions';

export const featureKey = 'topology';

export type TopologyState = {
  namespaces: Namespace[];
  queuesPerNamespace: Record<string, QueueWithMetaData[]>;
  topicsPerNamespace: Record<string, TopicWithMetaData[]>;
  subscriptionsPerNamespaceAndTopic: Record<
    string,
    Record<string, SubscriptionWithMetaData[]>
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
  on(internalActions.queueLoaded, (state, { namespace, queue }) => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: [...state.queuesPerNamespace[namespace.id], queue],
    },
  })),
  on(internalActions.topicsLoaded, (state, { namespace, topics }) => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespace.id]: topics,
    },
  })),
  on(internalActions.topicLoaded, (state, { namespace, topic }) => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespace.id]: [...state.topicsPerNamespace[namespace.id], topic],
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
  on(internalActions.subscriptionLoaded, (state, { namespace, topic, subscription }) => ({
    ...state,
    subscriptionsPerNamespaceAndTopic: {
      ...state.subscriptionsPerNamespaceAndTopic,
      [namespace.id]: {
        ...state.subscriptionsPerNamespaceAndTopic[namespace.id],
        [topic.id]: [...state.subscriptionsPerNamespaceAndTopic[namespace.id][topic.id], subscription],
      },
    }
  })),
  on(internalActions.queueRemoved, (state, {namespace, queueId}) => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: state.queuesPerNamespace[namespace.id].filter(queue => queue.id !== queueId)
    }
  })),
  on(internalActions.topicRemoved, (state, {namespace, topicId}) => ({
      ...state,
      topicsPerNamespace: {
        ...state.topicsPerNamespace,
        [namespace.id]: state.topicsPerNamespace[namespace.id].filter(topic => topic.id !== topicId)
      }
    }
  )),
  on(internalActions.subscriptionRemoved, (state, {namespace, topic, subscriptionId}) => ({
    ...state,
    subscriptionsPerNamespaceAndTopic: {
      ...state.subscriptionsPerNamespaceAndTopic,
      [namespace.id]: {
        ...state.subscriptionsPerNamespaceAndTopic[namespace.id],
        [topic.id]: state.subscriptionsPerNamespaceAndTopic[namespace.id][topic.id].filter(subscription => subscription.id !== subscriptionId)
      }
    }
  }))
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer,
});
