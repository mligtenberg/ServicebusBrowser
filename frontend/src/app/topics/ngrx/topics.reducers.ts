import { state } from "@angular/animations";
import { createReducer, on } from "@ngrx/store";
import * as actions from "./topics.actions";
import { ISubscriptionTopicSet, ITopicConnectionSet } from "./topics.models";

export interface ITopicsState {
    topicConnectionSets: ITopicConnectionSet[],
    subscriptionSets: ISubscriptionTopicSet[],
    loadingTopicsFor: string[],
    loadingSubscriptionsFor: string[]
}

const initialState: ITopicsState = {
    topicConnectionSets: [],
    subscriptionSets: [],
    loadingSubscriptionsFor: [],
    loadingTopicsFor: []
}

export const topicReducer = createReducer<ITopicsState>(
    initialState,
    on(actions.refreshTopics, (state, action) => {
        return {
            ...state,
            loadingTopicsFor: [
                ...state.loadingTopicsFor.filter(c => c != action.connectionId),
                action.connectionId
            ]
        }
    }),
    on(actions.refreshTopicsSuccess, (state, action) => {
        return {
            ...state,
            topicConnectionSets: [
                ...state.topicConnectionSets.filter(c => c.connectionId != action.connectionId),
                {
                    connectionId: action.connectionId,
                    topics: action.topics,
                }
            ],
            loadingTopicsFor: state.loadingTopicsFor.filter(c => c != action.connectionId)
        }
    }),
    on(actions.refreshSubscriptionsFailed, (state, action) => {
        return {
            ...state,
            loadingTopicsFor: state.loadingTopicsFor.filter(c => c != action.connectionId)
        }
    }),
    on(actions.refreshSubscriptions, (state, action) => {
        return {
            ...state,
            loadingSubscriptionsFor: [
                ...state.loadingSubscriptionsFor.filter(c => c != `${action.connectionId}/${action.topicName}`),
                `${action.connectionId}/${action.topicName}`
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
            ],
            loadingSubscriptionsFor: state.loadingSubscriptionsFor.filter(c => c != `${action.connectionId}/${action.topicName}`)
        }
    }),
    on(actions.refreshSubscriptionsFailed, (state, action) => {
        return {
            ...state,
            loadingSubscriptionsFor: state.loadingSubscriptionsFor.filter(c => c != `${action.connectionId}/${action.topicName}`)         
        }
    }),
    on(actions.updateTopicSuccesful, (state, action) => {
        const topicSet = state.topicConnectionSets.find(t => t.connectionId == action.connectionId);
        return {
            ...state,
            topicConnectionSets: [
                ...state.topicConnectionSets.filter(s => s.connectionId !== action.connectionId),
                {
                    ...topicSet,
                    topics: [
                        ...topicSet.topics.filter(t => t.name !== action.topic.name),
                        action.topic
                    ]
                }
            ]
        }
    })
)