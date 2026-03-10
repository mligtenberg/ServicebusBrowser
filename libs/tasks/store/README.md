# @service-bus-browser/tasks-store

NgRx store slice managing task state.

## Running unit tests

Run `nx test @service-bus-browser/tasks-store` to execute the unit tests.

## Usage
Dispatch actions to track operations:
```ts
store.dispatch(TasksActions.createTask({ id, description: 'Import messages' }));
store.dispatch(TasksActions.setProgress({ id, progress: 50 }));
store.dispatch(TasksActions.completeTask({ id }));
```
