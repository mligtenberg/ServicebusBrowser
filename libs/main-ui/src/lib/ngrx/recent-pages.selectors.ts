import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, RecentPagesState } from './recent-pages.store';

export const featureSelector = createFeatureSelector<RecentPagesState>(featureKey);

export const selectRecentPages = createSelector(
  featureSelector,
  (state) => state.items,
);
