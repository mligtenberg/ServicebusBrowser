import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IConnectionsState } from "./connections.reducers";

const getConnectionsFeatureState = createFeatureSelector<IConnectionsState>('connections');

export const getConnections = createSelector(
    getConnectionsFeatureState,
    state => state.connections
)

export const getSelectedConnection = createSelector(
    getConnectionsFeatureState,
    state => state.selectedConnection
)