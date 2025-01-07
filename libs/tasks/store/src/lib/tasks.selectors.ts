import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, TasksState } from './tasks.store';

const featureSelector = createFeatureSelector<TasksState>(featureKey);

export const selectTasks = createSelector(
  featureSelector,
  (state) => state.tasks
);
