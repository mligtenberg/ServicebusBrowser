import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ITopicsState } from "./topics.reducers";

const getTopicsFeatureState = createFeatureSelector<ITopicsState>('topics');

export const getTopics = (connectionId: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.topicConnectionSets.find(c => c.connectionId === connectionId)?.topics
)


export const getTopicSubscriptions = (connectionId: string, topicName: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.subscriptionSets.find(c => c.connectionId === connectionId && c.topicName === topicName)?.subscriptions
)
