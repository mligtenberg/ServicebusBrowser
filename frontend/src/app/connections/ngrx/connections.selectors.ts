import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IConnectionsState } from "./connections.reducers";

const getConnectionsFeatureState = createFeatureSelector<IConnectionsState>('connections');

export const getActiveConnections = createSelector(
    getConnectionsFeatureState,
    state => state.activeConnections
)

export const getStoredConnections = createSelector(
    getConnectionsFeatureState,
    state => state.storedConnections
)

export const getSelectedConnection = createSelector(
    getConnectionsFeatureState,
    state => state.selectedConnection
)