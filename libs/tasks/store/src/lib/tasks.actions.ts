import { createAction, props } from '@ngrx/store';

export const createTask = createAction(
  '[Tasks] Create Task',
  props<{
    id: string,
    description: string,
    statusDescription?: string,
    hasProgress?: boolean,
    initialProgress?: number,
  }>()
)

export const setProgress = createAction(
  '[Tasks] Set Progress',
  props<{
    id: string,
    progress: number,
    statusDescription?: string,
  }>()
)

export const completeTask = createAction(
  '[Tasks] Complete Task',
  props<{
    id: string,
    statusDescription?: string,
  }>()
)
