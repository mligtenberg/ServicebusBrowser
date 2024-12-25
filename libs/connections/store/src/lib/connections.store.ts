import { createFeature, createReducer, on } from '@ngrx/store';
import { Connection } from '@service-bus-browser/service-bus-contracts';

export const featureKey = 'connections';

export type ConnectionsState = {
  allConnections: Connection[];
  activeConnections: Connection[];
}

export const initialState: ConnectionsState = {
  allConnections: [],
  activeConnections: []
};

const connectionsReducer = createReducer(
  initialState,
);

export const connectionsFeature = createFeature({
  name: featureKey,
  reducer: connectionsReducer
});
