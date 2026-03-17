import { createAction, props } from '@ngrx/store';
import { TopologyNode } from '@service-bus-browser/api-contracts';

export const topologyRootNodesLoaded = createAction(
  '[Topology] Topology Root Nodes Loaded',
  props<{ nodes: TopologyNode[] }>(),
);

export const topologyRefreshed = createAction(
  '[Topology] Topology Refreshed',
  props<{ path: string; node: TopologyNode }>(),
);

export const topologyRefreshFailed = createAction(
  '[Topology] Topology Refresh Failed',
  props<{ path: string; error: unknown }>(),
);
