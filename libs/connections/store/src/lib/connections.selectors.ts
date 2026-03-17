import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConnectionsState, featureKey } from './connections.store';

const featureSelector = createFeatureSelector<ConnectionsState>(featureKey);

export const selectConnectionTestStatus = createSelector(
  featureSelector,
  (state) => state.connectionTestStatus
)

export const selectConnectionTested = createSelector(
  selectConnectionTestStatus,
  (status) => status === 'success'
)
