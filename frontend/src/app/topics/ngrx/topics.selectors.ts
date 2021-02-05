import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ITopicsState } from "./topics.reducers";

const getTopicsFeatureState = createFeatureSelector<ITopicsState>('topics');

export const getTopicsLoading = (connectionId: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.loadingTopicsFor.indexOf(connectionId) >= 0
);

export const getSubscriptionsLoading = (connectionId: string, topicName: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.loadingSubscriptionsFor.indexOf(`${connectionId}/${topicName}`) >= 0
);

export const getTopics = (connectionId: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.topicConnectionSets.find(c => c.connectionId === connectionId)?.topics
)

export const getTopic = (connectionId: string, topicName: string) => createSelector(
    getTopics(connectionId),
    (topics) => topics?.find(t => t.name === topicName)
)

export const getTopicSubscriptions = (connectionId: string, topicName: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.subscriptionSets.find(c => c.connectionId === connectionId && c.topicName === topicName)?.subscriptions
)

export const getTopicSubscription = (connectionId: string, topicName: string, subscriptionName: string) => createSelector(
    getTopicSubscriptions(connectionId, topicName),
    (subscriptions) => subscriptions
        .find(s => s.name === subscriptionName)
)
