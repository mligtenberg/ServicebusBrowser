import { createReducer, on } from "@ngrx/store";
import * as actions from "./topics.actions";
import { ITopicConnectionSet } from "./topics.models";

export interface ITopicsState {
    topicConnectionSets: ITopicConnectionSet[]
}

const initialState: ITopicsState = {
    topicConnectionSets: []
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
    })
)