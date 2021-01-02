import { createFeatureSelector, createSelector, props } from "@ngrx/store";
import { IQueuesState } from "./queues.reducers";

const getQueuesFeatureState = createFeatureSelector<IQueuesState>('queues');

export const getQueues = (connectionId: string) => createSelector(
    getQueuesFeatureState,
    (state) => state.queueConnectionSets.find(c => c.connectionId === connectionId)?.queues
)

export const getQueue = (connectionId: string, queueName: string) => createSelector(
    getQueues(connectionId),
    (queues) => queues.find(q => q.name === queueName)
)