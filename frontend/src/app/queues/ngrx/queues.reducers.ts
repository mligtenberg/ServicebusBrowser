import { createReducer, on } from "@ngrx/store";
import * as actions from "./queues.actions";
import { IQueueConnectionSet } from "./queues.models";

export interface IQueuesState {
    queueConnectionSets: IQueueConnectionSet[],
    loadingQueuesFor: string[];
}

const initialState: IQueuesState = {
    queueConnectionSets: [],
    loadingQueuesFor: []
}

export const queueReducer = createReducer<IQueuesState>(
    initialState,
    on (actions.refreshQueues, (state, action) => {
        return {
            ...state,
            loadingQueuesFor: [
                ...state.loadingQueuesFor.filter(c => c !== action.connectionId),
                action.connectionId
            ]
        }
    }),
    on  (actions.refreshQueuesSuccess, (state, action) => {
        return {
            ...state,
            queueConnectionSets: [
                ...state.queueConnectionSets.filter(c => c.connectionId != action.connectionId),
                {
                    connectionId: action.connectionId,
                    queues: action.queues
                }
            ],
            loadingQueuesFor: state.loadingQueuesFor.filter(c => c !== action.connectionId)
        }
    }),
    on  (actions.refreshQueuesFailed, (state, action) => {
        return {
            ...state,
            loadingQueuesFor: state.loadingQueuesFor.filter(c => c !== action.connectionId)
        }
    }),
    on(actions.updateQueueSuccesful, (state, action) => {
        const queueSet = state.queueConnectionSets.find(q => q.connectionId === action.connectionId);
        return {
            ...state,
            queueConnectionSets: [
                ...state.queueConnectionSets.filter(q => q.connectionId !== action.connectionId),
                {
                    ...queueSet,
                    queues: [
                        ...queueSet.queues.filter(q => q.name !== action.queue.name),
                        action.queue
                    ]
                }
            ]
        }
    })
)