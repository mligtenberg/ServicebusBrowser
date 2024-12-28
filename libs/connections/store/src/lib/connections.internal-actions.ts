import { createAction, props } from '@ngrx/store';
import { Problem, UUID } from '@service-bus-browser/shared-contracts';
import { Connection } from '@service-bus-browser/service-bus-contracts';

export const connectionActivated = createAction(
  '[Connections] Connection Activated',
  props<{ connectionId: UUID }>()
);

export const failedToActivateConnection = createAction(
  '[Connections] Failed To Activate Connection',
  props<{ connectionId: UUID, error: Problem }>()
);

export const connectionAdded = createAction(
  '[Connections] Connection Added',
  props<{ connectionId: UUID }>()
);

export const failedToAddConnection = createAction(
  '[Connections] Failed To Add Connection',
  props<{ connectionId: UUID, error: Problem }>()
);

export const connectionRemoved = createAction(
  '[Connections] Connection Removed',
  props<{ connectionId: UUID }>()
);

export const failedToRemoveConnection = createAction(
  '[Connections] Failed To Remove Connection',
  props<{ connectionId: UUID, error: Problem }>()
);

export const connectionCheckedSuccessfully = createAction(
  '[Connections] Connection Checked Successfully',
  props<{ connection: Connection }>()
);

export const connectionCheckFailed = createAction(
  '[Connections] Connection Check Failed',
  props<{ connection: Connection }>()
);

