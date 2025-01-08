import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, RouteState } from './route.store';

const featureSelector = createFeatureSelector<RouteState>(featureKey);

export const selectRoute = createSelector(
  featureSelector,
  (state) => state.route
);
