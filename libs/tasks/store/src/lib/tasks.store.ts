import { createFeature, createReducer, on } from '@ngrx/store';
import { Task } from '@service-bus-browser/tasks-contracts';
import * as Actions from './tasks.actions';

export const featureKey = 'tasks';

export type TasksState = {
  tasks: Task[];
};

export const initialState: TasksState = {
  tasks: [],
};

export const reducer = createReducer(
  initialState,
  on(
    Actions.createTask,
    (
      state,
      { id, description, statusDescription, hasProgress, initialProgress }
    ) => {
      const existingTask = state.tasks.find((task) => task.id === id);
      if (existingTask) {
        return state;
      }

      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id,
            description,
            statusDescription,
            hasProgress,
            createdAt: new Date(),
            status: 'in-progress',
            progress: initialProgress ?? 0,
          } as Task,
        ],
      };
    }
  ),
  on(Actions.setProgress, (state, { id, progress, statusDescription }) => ({
    ...state,
    tasks: state.tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          progress,
          statusDescription
        };
      }
      return task;
    }),
  })),
on(Actions.completeTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((task) => task.id !== id),
  }))
);

export const feature = createFeature({
  name: featureKey,
  reducer: reducer,
});
