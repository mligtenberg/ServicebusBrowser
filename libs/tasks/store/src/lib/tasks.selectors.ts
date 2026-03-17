import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, TasksState } from './tasks.store';
import { UUID } from '@service-bus-browser/shared-contracts';

const featureSelector = createFeatureSelector<TasksState>(featureKey);

export const selectTasks = createSelector(
  featureSelector,
  (state) => state.tasks
);


export const selectTaskCanceled = (taskId: UUID) =>
  createSelector(featureSelector, (state) => !state.tasks.some(t => t.id === taskId));
