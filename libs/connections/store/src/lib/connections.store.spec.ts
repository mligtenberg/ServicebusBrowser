import { connectionsFeature, initialState } from './connections.store';
import * as Actions from './connections.actions';
import * as InternalActions from './connections.internal-actions';
import { Connection } from '@service-bus-browser/service-bus-contracts';
describe('connections reducer', () => {
  const connection: Connection = {
    id: '00000000-0000-0000-0000-000000000001',
    type: 'connectionString',
    name: 'conn',
    connectionString: 'Endpoint=sb://test/',
  };
  it('marks connection under test', () => {
    const state = connectionsFeature.reducer(
      initialState,
      Actions.checkConnection({ connection })
    );
    expect(state.connectionUnderTest).toEqual(connection);
    expect(state.connectionTestStatus).toBe('none');
  });
  it('sets success status', () => {
    let state = connectionsFeature.reducer(
      initialState,
      Actions.checkConnection({ connection })
    );
    state = connectionsFeature.reducer(
      state,
      InternalActions.connectionCheckedSuccessfully({ connection })
    );
    expect(state.connectionTestStatus).toBe('success');
  });
  it('sets error status', () => {
    let state = connectionsFeature.reducer(
      initialState,
      Actions.checkConnection({ connection })
    );
    state = connectionsFeature.reducer(
      state,
      InternalActions.connectionCheckFailed({ connection })
    );
    expect(state.connectionTestStatus).toBe('error');
  });
});
