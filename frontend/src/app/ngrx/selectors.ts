import { createFeatureSelector, createSelector } from '@ngrx/store';
import {IGlobalState} from './reducer';

const globalStateSelector = createFeatureSelector<IGlobalState>('global');

export const tasksSelector = createSelector(globalStateSelector, (state) => state.activeTasks);
