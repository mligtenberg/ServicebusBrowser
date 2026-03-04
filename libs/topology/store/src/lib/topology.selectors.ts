import { featureKey, TopologyState } from './topology.store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  NamespaceWithChildrenAndLoadingState,
  TopicWithChildrenAndLoadingState,
} from '@service-bus-browser/topology-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint } from '@service-bus-browser/message-queue-contracts';

const featureSelector = createFeatureSelector<TopologyState>(featureKey);

export const selectRootNodes = createSelector(featureSelector, (state) => state.rootNodes);
export const selectTopologyPathLoading = (path: string) => createSelector(featureSelector, (state) =>
  state.refreshingPaths.some(p => p === path || path.startsWith(p))
);
