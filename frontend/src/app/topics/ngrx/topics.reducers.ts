import { createReducer, on } from "@ngrx/store";
import * as actions from "./topics.actions";
import { ISubscriptionTopicSet, ITopicConnectionSet } from "./topics.models";

export interface ITopicsState {
    topicConnectionSets: ITopicConnectionSet[],
    subscriptionSets: ISubscriptionTopicSet[]
}

const initialState: ITopicsState = {
    topicConnectionSets: [],
    subscriptionSets: []
}

export const topicReducer = createReducer<ITopicsState>(
    initialState,
    on(actions.refreshTopicsSuccess, (state, action) => {
        return {
            ...state,
            topicConnectionSets: [
                ...state.topicConnectionSets.filter(c => c.connectionId != action.connectionId),
                {
                    connectionId: action.connectionId,
                    topics: action.topics
                }
            ]
        }
    }),
    on(actions.refreshSubscriptionsSuccess, (state, action) => {
        return {
            ...state,
            subscriptionSets: [
                ...state.subscriptionSets.filter(c => c.connectionId !== action.connectionId || c.topicName !== action.topicName),
                {
                    connectionId: action.connectionId,
                    topicName: action.topicName,
                    subscriptions: action.subscriptions
                }
            ]
        }
    })
)