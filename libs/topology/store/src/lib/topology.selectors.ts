import { featureKey, TopologyState } from './topology.store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  NamespaceWithChildrenAndLoadingState,
  TopicWithChildrenAndLoadingState
} from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';

const featureSelector = createFeatureSelector<TopologyState>(featureKey);

export const selectNamespaces = createSelector(
  featureSelector,
  (state) => state.namespaces.map<NamespaceWithChildrenAndLoadingState>((ns) => ({
    ...ns,
    isLoadingQueues: state.queueLoadActions.some((a) => a.namespaceId === ns.id),
    isLoadingTopics: state.topicLoadActions.some((a) => a.namespaceId === ns.id),
    hasQueuesLoadingError: state.queueLoadErrors.some((a) => a.namespaceId === ns.id),
    hasTopicsLoadingError: state.topicLoadErrors.some((a) => a.namespaceId === ns.id),
    queues: state.queuesPerNamespace[ns.id] ?? [],
    topics: (state.topicsPerNamespace[ns.id] ?? []).map((topic): TopicWithChildrenAndLoadingState => ({
      ...topic,
      isLoading: state.subscriptionLoadActions.some((a) => a.namespaceId === ns.id && a.topicId === topic.id),
      hasLoadingError: state.subscriptionLoadErrors.some((a) => a.namespaceId === ns.id && a.topicId === topic.id),
      subscriptions: state.subscriptionsPerNamespaceAndTopic[ns.id]?.[topic.id]?.map(s => ({
        ...s,
        isLoading: state.rulesLoadActions.some((a) => a.namespaceId === ns.id && a.topicId === topic.id && a.subscriptionId === s.id),
        hasLoadingError: state.rulesLoadErrors.some((a) => a.namespaceId === ns.id && a.topicId === topic.id && a.subscriptionId === s.id),
      })) ?? [],
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

export const selectSubscriptionRuleById = (namespaceId: UUID, topicId: string, subscriptionId: string, ruleName: string) => createSelector(
  selectSubscriptionById(namespaceId, topicId, subscriptionId),
  (subscription) => subscription?.rules.find((r) => r.name === ruleName)
);

export const selectByReceiveEndpoint = (receiveEndpoint: ReceiveEndpoint) => createSelector(
  selectNamespaceById(receiveEndpoint.connectionId),
  (namespace) => {
    if ('queueName' in receiveEndpoint) {
      return namespace?.queues.find(q => q.name === receiveEndpoint.queueName);
    }
    if ('topicName' in receiveEndpoint && 'subscriptionName' in receiveEndpoint) {
      return namespace?.topics.find(t => t.name === receiveEndpoint.topicName)?.subscriptions.find(s => s.name === receiveEndpoint.subscriptionName);
    }

    return null;
  }
)
