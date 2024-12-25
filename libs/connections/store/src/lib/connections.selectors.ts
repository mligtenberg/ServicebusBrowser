import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConnectionsState, featureKey } from './connections.store';

const featureSelector = createFeatureSelector<ConnectionsState>(featureKey);


export const selectAllConnections = createSelector(
  featureSelector,
  (state) => state.allConnections
)

export const selectActiveConnections = createSelector(
  featureSelector,
  (state) => state.activeConnections
)

export const selectInactiveConnections = createSelector(
  selectAllConnections,
  selectActiveConnections,
  (allConnections, activeConnections) => allConnections.filter(connection => !activeConnections.includes(connection))
)
