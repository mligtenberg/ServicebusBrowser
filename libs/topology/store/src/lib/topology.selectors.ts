import { featureKey, TopologyState } from './topology.store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NamespaceWithChildren, QueueWithMetaData, TopicWithChildren } from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

const featureSelector = createFeatureSelector<TopologyState>(featureKey);

export const selectNamespaces = createSelector(
  featureSelector,
  (state) => state.namespaces.map<NamespaceWithChildren<QueueWithMetaData, TopicWithChildren>>((ns) => ({
    ...ns,
    queues: state.queuesPerNamespace[ns.id] ?? [],
    topics: (state.topicsPerNamespace[ns.id] ?? []).map((topic) => ({
      ...topic,
      subscriptions: state.subscriptionsPerNamespaceAndTopic[ns.id]?.[topic.id] ?? [],
    })),
  }))
);

export const selectNamespaceById = (id: UUID) => createSelector(
    selectNamespaces,
    (namespaces) => namespaces.find((ns) => ns.id === id));


export const selectQueueById = (namespaceId: UUID, queueId: string) => createSelector(
  selectNamespaceById(namespaceId),
  (ns) =>  ns?.queues.find((q) => q.id === queueId)
);

export const selectTopicById = (namespaceId: UUID, topicId: string) => createSelector(
  selectNamespaceById(namespaceId),
  (ns) => ns?.topics.find((t) => t.id === topicId)
);

export const selectSubscriptionById = (namespaceId: UUID, topicId: string, subscriptionId: string) => createSelector(
  selectTopicById(namespaceId, topicId),
  (topic) => topic?.subscriptions.find((s) => s.id === subscriptionId)
);
