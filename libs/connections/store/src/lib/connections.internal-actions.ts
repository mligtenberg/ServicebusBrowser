import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const connectionActivated = createAction(
  '[Connections] Connection Activated',
  props<{ connectionId: string }>()
);

export const connectionAdded = createAction(
  '[Connections] Connection Added',
  props<{ connectionId: UUID }>()
);
