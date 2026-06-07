import { featureKey, TopologyState } from './topology.store';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const featureSelector = createFeatureSelector<TopologyState>(featureKey);

export const selectRootNodes = createSelector(featureSelector, (state) => state.rootNodes);
export const selectLoaded = createSelector(featureSelector, (state) => state.loaded);
export const selectTopologyPathLoading = (path: string) => createSelector(featureSelector, (state) =>
  state.refreshingPaths.some(p => p === path || path.startsWith(p))
);
export const selectTopologyPathHasError = (path: string) =>
  createSelector(featureSelector, (state) =>
    state.erroredPaths.some((p) => p === path || path.startsWith(p)),
  );
