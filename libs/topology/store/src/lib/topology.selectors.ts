import { featureKey, TopologyState } from './topology.store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NamespaceWithChildren, Queue, TopicWithChildren } from '@service-bus-browser/topology-contracts';

const featureSelector = createFeatureSelector<TopologyState>(featureKey);

export const selectNamespaces = createSelector(
  featureSelector,
  (state) => state.namespaces.map<NamespaceWithChildren<Queue, TopicWithChildren>>((ns) => ({
    ...ns,
    queues: state.queuesPerNamespace[ns.id] ?? [],
    topics: (state.topicsPerNamespace[ns.id] ?? []).map((topic) => ({
      ...topic,
      subscriptions: state.subscriptionsPerNamespaceAndTopic[ns.id]?.[topic.id] ?? [],
    })),
  }))
);

export const selectNamespaceById = (id: string) => createSelector(
  selectNamespaces,
  (namespaces) => namespaces.find((ns) => ns.id === id)
);

export const selectQueueById = (namespaceId: string, queueId: string) => createSelector(
  selectNamespaceById(namespaceId),
  (ns) => ns?.queues.find((q) => q.id === queueId)
);

export const selectTopicById = (namespaceId: string, topicId: string) => createSelector(
  selectNamespaceById(namespaceId),
  (ns) => ns?.topics.find((t) => t.id === topicId)
);

export const selectSubscriptionById = (namespaceId: string, topicId: string, subscriptionId: string) => createSelector(
  selectTopicById(namespaceId, topicId),
  (topic) => topic?.subscriptions.find((s) => s.id === subscriptionId)
);
