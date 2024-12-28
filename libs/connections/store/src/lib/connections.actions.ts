import { createAction, props } from '@ngrx/store';
import { Connection } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export const addConnection = createAction(
  '[Connections] Add Connection',
  props<{ connection: Connection }>()
);

export const checkConnection = createAction(
  '[Connections] Check Connection',
  props<{ connection: Connection }>()
);

export const removeConnection = createAction(
  '[Connections] Remove Connection',
  props<{ connectionId: UUID }>()
);

export const activateConnection = createAction(
  '[Connections] Activate Connection',
  props<{ connection: Connection }>()
);
