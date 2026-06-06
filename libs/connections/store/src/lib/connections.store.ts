import { createFeature, createReducer, on } from '@ngrx/store';
import { Connection } from '@service-bus-browser/api-contracts';
import { Problem } from '@service-bus-browser/shared-contracts';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';

export const featureKey = 'connections';

export type ConnectionsState = {
  connectionTestStatus: 'none' | 'success' | 'error';
  connectionUnderTest: Connection | null;
  connectionTestError: Problem | null;
};

export const initialState: ConnectionsState = {
  connectionTestStatus: 'none',
  connectionUnderTest: null,
  connectionTestError: null,
};

const connectionsReducer = createReducer(
  initialState,
  on(
    internalActions.connectionCheckedSuccessfully,
    (state, { connection }) => ({
      ...state,
      connectionTestStatus: 'success' as const,
      connectionUnderTest: connection,
      connectionTestError: null,
    }),
  ),
  on(internalActions.connectionCheckFailed, (state, { connection, error }) => ({
    ...state,
    connectionTestStatus: 'error' as const,
    connectionUnderTest: connection,
    connectionTestError: error,
  })),
  on(actions.resetConnectionTest, (state) => ({
    ...state,
    connectionTestStatus: 'none' as const,
    connectionUnderTest: null,
    connectionTestError: null,
  })),
  on(actions.checkConnection, (state, { connection }) => ({
    ...state,
    connectionTestStatus: 'none' as const,
    connectionUnderTest: connection,
    connectionTestError: null,
  })),
);

export const connectionsFeature = createFeature({
  name: featureKey,
  reducer: connectionsReducer,
});
