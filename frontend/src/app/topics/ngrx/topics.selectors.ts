import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ITopicsState } from "./topics.reducers";

const getTopicsFeatureState = createFeatureSelector<ITopicsState>('topics');

export const getTopics = (connectionId: string) => createSelector(
    getTopicsFeatureState,
    (state) => state.topicConnectionSets.find(c => c.connectionId === connectionId)?.topics
)
