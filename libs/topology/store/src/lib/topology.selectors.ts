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
