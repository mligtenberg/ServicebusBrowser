import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const createTask = createAction(
  '[Tasks] Create Task',
  props<{
    id: UUID,
    description: string,
    statusDescription?: string,
    hasProgress?: boolean,
    initialProgress?: number,
  }>()
)

export const setProgress = createAction(
  '[Tasks] Set Progress',
  props<{
    id: UUID,
    progress: number,
    statusDescription?: string,
  }>()
)

export const completeTask = createAction(
  '[Tasks] Complete Task',
  props<{
    id: UUID,
    statusDescription?: string,
  }>()
)
