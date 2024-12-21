import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, LogsState } from './logs.store';

const featureSelector = createFeatureSelector<LogsState>(featureKey);

export const selectLogs = createSelector(
  featureSelector,
  (state) => state.logs
)
