import { createFeature, createReducer, on } from '@ngrx/store';

import * as internalActions from './topology.internal-actions';
import * as actions from './topology.actions';
import { TopologyNode } from '@service-bus-browser/message-queue-contracts';

export const featureKey = 'topology';

export type TopologyState = {
  rootNodes: TopologyNode[];
  refreshingPaths: string[];
  erroredPaths: string[];
};

export const initialState: TopologyState = {
  rootNodes: [],
  refreshingPaths: [],
  erroredPaths: [],
};

export const logsReducer = createReducer(
  initialState,
  on(actions.loadTopologyRootNodes, (state) => ({
    ...state,
    rootNodes: [],
    refreshingPaths: [],
    erroredPaths: [],
  })),
  on(
    internalActions.topologyRootNodesLoaded,
    (state, { nodes }): TopologyState => ({
      ...state,
      rootNodes: nodes,
    }),
  ),
  on(
    actions.refreshTopology,
    (state, { path }): TopologyState => ({
      ...state,
      refreshingPaths: [...state.refreshingPaths, path],
    }),
  ),
  on(
    internalActions.topologyRefreshed,
    (state, { path, node }): TopologyState => {
      const patch = (oldNode: TopologyNode): TopologyNode => {
        if (oldNode.path === path) {
          return node;
        }

        if (path.startsWith(oldNode.path)) {
          return {
            ...oldNode,
            children: oldNode.children?.map(patch),
          };
        }

        return oldNode;
      };

      return {
        ...state,
        rootNodes: state.rootNodes.map(patch),
        refreshingPaths: state.refreshingPaths.filter((p) => p !== path),
        erroredPaths: state.erroredPaths.filter((p) => p !== path),
      };
    },
  ),
  on(
    internalActions.topologyRefreshFailed,
    (state, { path }) => ({
      ...state,
      refreshingPaths: state.refreshingPaths.filter((p) => p !== path),
      erroredPaths: [...state.refreshingPaths, path],
    })
  )
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer,
});
