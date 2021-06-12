import { createReducer, on } from '@ngrx/store';
import {ITask} from './models';
import * as actions from './actions';

export interface IGlobalState {
  activeTasks: ITask[];
}

export const initialState: IGlobalState = {
  activeTasks: []
};

export const globalStateReducer = createReducer(
  initialState,
  on(actions.createTask, (state, action) => {
    return {
      ...state,
      activeTasks: [
        ...state.activeTasks,
        {
          id: action.id,
          title: action.title,
          subtitle: action.subtitle,
          donePercentage: action.donePercentage,
          progressBarMessage: action.progressBarMessage
        }
      ]
    };
  }),
  on(actions.updateTaskDonePercentage, (state, action) => {
    return {
      ...state,
      activeTasks: state.activeTasks.map(t => {
        return t.id !== action.id ? t : {
          ...t,
          donePercentage: action.donePercentage,
          progressBarMessage: action.progressBarMessage
        };
      })
    };
  }),
  on(actions.finishTaskComplete, (state, action) => {
    return {
      ...state,
      activeTasks: state.activeTasks.filter(t => t.id !== action.id)
    };
  })
);

