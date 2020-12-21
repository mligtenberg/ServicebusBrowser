import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ILoggingState } from "./logging.reducers";

const getLoggingFeatureState = createFeatureSelector<ILoggingState>('logging');

export const getLogs = createSelector(
    getLoggingFeatureState,
    state => state.logItems
)

export const getLogMessages = createSelector(
    getLoggingFeatureState,
    state => state.logItems.map(l => l.message)
)