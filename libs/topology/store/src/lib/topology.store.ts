import { createFeature, createReducer, on } from '@ngrx/store';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionWithMetaData,
  TopicWithMetaData,
} from '@service-bus-browser/topology-contracts';

import * as internalActions from './topology.internal-actions';
import * as actions from './topology.actions';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologyNode } from '@service-bus-browser/message-queue-contracts';

export const featureKey = 'topology';

export type TopologyState = {
  rootNodes: TopologyNode[];
  refreshingPaths: string[];
};

export const initialState: TopologyState = {
  rootNodes: [],
  refreshingPaths: []
};

export const logsReducer = createReducer(
  initialState,
  on(actions.loadTopologyRootNodes, (state) => ({
    ...state,
    rootNodes: state.rootNodes,
    refreshingPaths: state.refreshingPaths,
  })),
  on(internalActions.topologyRootNodesLoaded, (state, { nodes }): TopologyState => ({
    ...state,
    rootNodes: nodes,
  })),
  on(internalActions.topologyRefreshed, (state, { path, node }): TopologyState => {
    const patch = (oldNode: TopologyNode): TopologyNode => {
      if (oldNode.path === path) {
        return node
      }

      if (path.startsWith(oldNode.path)) {
        return {
          ...oldNode,
          children: oldNode.children?.map(patch)
        }
      }

      return oldNode;
    }

    return {
      ...state,
      rootNodes: state.rootNodes.map(patch)
    }
  }),
  on(actions.refreshTopology, (state, { path }): TopologyState => ({
    ...state,
    refreshingPaths: [
      ...state.refreshingPaths,
      path,
    ]
  })),
  on(internalActions.topologyRefreshed, (state, { path }) => ({
    ...state,
    refreshingPaths: state.refreshingPaths.filter(p => p !== path),
  }))
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer,
});
