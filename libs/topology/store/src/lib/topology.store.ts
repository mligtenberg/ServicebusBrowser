import { createFeature, createReducer, on } from '@ngrx/store';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionWithMetaData,
  TopicWithMetaData,
} from '@service-bus-browser/topology-contracts';

import * as internalActions from './topology.internal-actions';
import * as actions from './topology.actions';
import { UUID } from '@service-bus-browser/shared-contracts';

export const featureKey = 'topology';

export type TopologyState = {
  namespaces: Namespace[];
  queuesPerNamespace: Record<string, QueueWithMetaData[]>;
  topicsPerNamespace: Record<string, TopicWithMetaData[]>;
  subscriptionsPerNamespaceAndTopic: Record<
    string,
    Record<string, SubscriptionWithMetaData[]>
  >;
  queueLoadActions: Array<{ namespaceId: UUID }>
  topicLoadActions: Array<{ namespaceId: UUID }>
  subscriptionLoadActions: Array<{ namespaceId: UUID, topicId: string }>,
  rulesLoadActions: Array<{ namespaceId: UUID, topicId: string, subscriptionId: string }>
};

export const initialState: TopologyState = {
  namespaces: [],
  queuesPerNamespace: {},
  topicsPerNamespace: {},
  subscriptionsPerNamespaceAndTopic: {},
  queueLoadActions: [],
  topicLoadActions: [],
  subscriptionLoadActions: [],
  rulesLoadActions: []
};

export const logsReducer = createReducer(
  initialState,
  on(actions.loadQueues, actions.loadQueue, (state, { namespaceId }): TopologyState => ({
    ...state,
    queueLoadActions: [...state.queueLoadActions, { namespaceId }],
  })),
  on(internalActions.namespacesLoaded, (state, { namespaces }): TopologyState  => ({
    ...state,
    namespaces,
  })),
  on(internalActions.queuesLoaded, (state, { namespace, queues }): TopologyState  => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: queues.sort((a, b) => a.name.localeCompare(b.name)),
    },
    queueLoadActions: state.queueLoadActions.filter(a => a.namespaceId !== namespace.id)
  })),
  on(internalActions.queueLoaded, (state, { namespace, queue }): TopologyState  => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: [...state.queuesPerNamespace[namespace.id].filter(q => q.id !== queue.id), queue]
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    queueLoadActions: state.queueLoadActions.filter(a => a.namespaceId !== namespace.id)
  })),
  on(actions.loadTopics, actions.loadTopic, (state, { namespaceId }): TopologyState => ({
    ...state,
    topicLoadActions: [...state.topicLoadActions, { namespaceId }],
  })),
  on(internalActions.topicsLoaded, (state, { namespace, topics }): TopologyState  => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespace.id]: topics.sort((a, b) => a.name.localeCompare(b.name)),
    },
    topicLoadActions: state.topicLoadActions.filter(a => a.namespaceId !== namespace.id)
  })),
  on(internalActions.topicLoaded, (state, { namespace, topic }): TopologyState  => ({
    ...state,
    topicsPerNamespace: {
      ...state.topicsPerNamespace,
      [namespace.id]: [...state.topicsPerNamespace[namespace.id], topic].sort((a, b) => a.name.localeCompare(b.name)),
    },
    topicLoadActions: state.topicLoadActions.filter(a => a.namespaceId !== namespace.id)
  })),
  on(actions.loadSubscriptions, (state, { namespaceId, topicId }): TopologyState => ({
    ...state,
    topicLoadActions: [...state.topicLoadActions, { namespaceId }],
    subscriptionLoadActions: [...state.subscriptionLoadActions, { namespaceId, topicId }],
  })),
  on(actions.loadSubscription, (state, { namespaceId, topicId, subscriptionId }): TopologyState => ({
    ...state,
    topicLoadActions: [...state.topicLoadActions, { namespaceId }],
    subscriptionLoadActions: [...state.subscriptionLoadActions, { namespaceId, topicId }],
    rulesLoadActions: [...state.rulesLoadActions, { namespaceId, topicId, subscriptionId }]
  })),
  on(
    internalActions.subscriptionsLoaded,
    (state, { namespace, topic, subscriptions }): TopologyState  => ({
      ...state,
      subscriptionsPerNamespaceAndTopic: {
        ...state.subscriptionsPerNamespaceAndTopic,
        [namespace.id]: {
          ...state.subscriptionsPerNamespaceAndTopic[namespace.id],
          [topic.id]: subscriptions.sort((a, b) => a.name.localeCompare(b.name)),
        },
      },
      topicLoadActions: state.topicLoadActions.filter(a => a.namespaceId !== namespace.id),
      subscriptionLoadActions: state.subscriptionLoadActions.filter(a => a.namespaceId !== namespace.id && a.topicId !== topic.id)
    })
  ),
  on(internalActions.subscriptionLoaded, (state, { namespace, topic, subscription }): TopologyState  => ({
    ...state,
    subscriptionsPerNamespaceAndTopic: {
      ...state.subscriptionsPerNamespaceAndTopic,
      [namespace.id]: {
        ...state.subscriptionsPerNamespaceAndTopic[namespace.id],
        [topic.id]: [...state.subscriptionsPerNamespaceAndTopic[namespace.id][topic.id].filter(s => s.id !== subscription.id), subscription].sort((a, b) => a.name.localeCompare(b.name)),
      },
    },
    topicLoadActions: state.topicLoadActions.filter(a => a.namespaceId !== namespace.id),
    subscriptionLoadActions: state.subscriptionLoadActions.filter(a => a.namespaceId !== namespace.id && a.topicId !== topic.id),
    rulesLoadActions: state.rulesLoadActions.filter(a => a.namespaceId !== namespace.id && a.topicId !== topic.id && a.subscriptionId !== subscription.id)
  })),
  on(internalActions.queueRemoved, (state, {namespace, queueId}): TopologyState  => ({
    ...state,
    queuesPerNamespace: {
      ...state.queuesPerNamespace,
      [namespace.id]: state.queuesPerNamespace[namespace.id].filter(queue => queue.id !== queueId)
    }
  })),
  on(internalActions.topicRemoved, (state, {namespace, topicId}): TopologyState  => ({
      ...state,
      topicsPerNamespace: {
        ...state.topicsPerNamespace,
        [namespace.id]: state.topicsPerNamespace[namespace.id].filter(topic => topic.id !== topicId)
      }
    }
  )),
  on(internalActions.subscriptionRemoved, (state, {namespace, topic, subscriptionId}): TopologyState  => ({
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
