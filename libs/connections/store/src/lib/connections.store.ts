import { createFeature, createReducer, on } from '@ngrx/store';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';

export const featureKey = 'connections';

export type ConnectionsState = {
  allConnections: Connection[];
  activeConnections: Connection[];
  connectionTestStatus: 'none' | 'success' | 'error';
  connectionUnderTest: Connection | null;
}

export const initialState: ConnectionsState = {
  allConnections: [],
  activeConnections: [],
  connectionTestStatus: 'none',
  connectionUnderTest: null
};

const connectionsReducer = createReducer(
  initialState,
  on(internalActions.connectionCheckedSuccessfully, (state, { connection }) => ({
    ...state,
    connectionTestStatus: 'success' as const,
    connectionUnderTest: connection
  })),
  on(internalActions.connectionCheckFailed, (state, { connection }) => ({
    ...state,
    connectionTestStatus: 'error' as const,
    connectionUnderTest: connection
  })),
  on(actions.resetConnectionTest, (state) => ({
    ...state,
    connectionTestStatus: 'none' as const,
    connectionUnderTest: null
  })),
  on(actions.checkConnection, (state, { connection }) => ({
    ...state,
    connectionTestStatus: 'none' as const,
    connectionUnderTest: connection
  }))
);

export const connectionsFeature = createFeature({
  name: featureKey,
  reducer: connectionsReducer
});
