import { createAction, props } from '@ngrx/store';

export const createTask = createAction('[global/tasks] create', props<{
  id: string,
  title: string,
  subtitle: string,
  donePercentage: number,
  progressBarMessage?: string
}>());

export const updateTaskDonePercentage = createAction('[global/tasks] update percentage', props<{
  id: string,
  donePercentage: number,
  progressBarMessage?: string
}>());

export const finishTask = createAction('[global/tasks] finish task', props<{
  id: string
}>());

export const finishTaskComplete = createAction('[global/tasks] task has been finished', props<{
  id: string
}>());
