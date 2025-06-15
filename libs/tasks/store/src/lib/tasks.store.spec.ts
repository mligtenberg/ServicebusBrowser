import { reducer, initialState } from './tasks.store';
import * as Actions from './tasks.actions';

describe('tasks reducer', () => {
  it('creates a new task', () => {
    const state = reducer(initialState, Actions.createTask({ id: '1', description: 'Test' }));
    expect(state.tasks.length).toBe(1);
    expect(state.tasks[0]).toMatchObject({ id: '1', description: 'Test', status: 'in-progress', progress: 0 });
  });

  it('updates progress of a task', () => {
    let state = reducer(initialState, Actions.createTask({ id: '1', description: 'Test', hasProgress: true }));
    state = reducer(state, Actions.setProgress({ id: '1', progress: 50 }));
    expect(state.tasks[0].progress).toBe(50);
  });

  it('completes a task', () => {
    let state = reducer(initialState, Actions.createTask({ id: '1', description: 'Test' }));
    state = reducer(state, Actions.completeTask({ id: '1' }));
    expect(state.tasks.length).toBe(0);
  });
});
