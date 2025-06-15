import { logsReducer, initialState } from './logs.store';
import { writeLog } from './logs.actions';

describe('logsReducer', () => {
  it('should add a log entry', () => {
    const state = logsReducer(initialState, writeLog({ severity: 'info', message: 'test', context: { a: 1 } }));
    expect(state.logs.length).toBe(1);
    expect(state.logs[0]).toMatchObject({ severity: 'info', message: 'test', context: { a: 1 } });
  });
});
