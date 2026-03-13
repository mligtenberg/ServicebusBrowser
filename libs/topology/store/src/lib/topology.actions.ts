import { createAction, props } from '@ngrx/store';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';

export const loadTopologyRootNodes = createAction(
  '[Topology] Load topology root nodes',
);
export const refreshTopology = createAction(
  '[Topology] Refresh topology',
  props<{ path: string }>(),
);

// external reloads
export const reloadReceiveEndpoint = createAction(
  '[Topology] Reload receive endpoints',
  props<{ endpoint: ReceiveEndpoint }>(),
);

export const reloadSendEndpoint = createAction(
  '[Topology] Reload send endpoints',
  props<{ endpoint: SendEndpoint }>(),
);
