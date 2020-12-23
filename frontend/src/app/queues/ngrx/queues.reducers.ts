import { createReducer, on } from "@ngrx/store";
import * as actions from "./queues.actions";
import { IQueueConnectionSet } from "./queues.models";

export interface IQueuesState {
    queueConnectionSets: IQueueConnectionSet[]
}

const initialState: IQueuesState = {
    queueConnectionSets: []
}

export const queueReducer = createReducer<IQueuesState>(
    initialState,
    on  (actions.refreshQueuesSuccess, (state, action) => {
        return {
            ...state,
            queueConnectionSets: [
                ...state.queueConnectionSets.filter(c => c.connectionId != action.connectionId),
                {
                    connectionId: action.connectionId,
                    queues: action.queues
                }
            ]
        }
    })
)