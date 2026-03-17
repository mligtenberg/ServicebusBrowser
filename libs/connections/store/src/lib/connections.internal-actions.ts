import { createAction, props } from '@ngrx/store';
import { Problem, UUID } from '@service-bus-browser/shared-contracts';
import { Connection } from '@service-bus-browser/api-contracts';

export const connectionAdded = createAction(
  '[Connections] Connection Added',
  props<{ connectionId: UUID }>(),
);

export const failedToAddConnection = createAction(
  '[Connections] Failed To Add Connection',
  props<{ connectionId: UUID; error: Problem }>(),
);

export const connectionCheckedSuccessfully = createAction(
  '[Connections] Connection Checked Successfully',
  props<{ connection: Connection }>(),
);

export const connectionCheckFailed = createAction(
  '[Connections] Connection Check Failed',
  props<{ connection: Connection }>(),
);
