import { createAction, props } from '@ngrx/store';
import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export const addConnection = createAction(
  '[Connections] Add Connection',
  props<{ connection: Connection }>(),
);

export const checkConnection = createAction(
  '[Connections] Check Connection',
  props<{ connection: Connection }>(),
);

export const resetConnectionTest = createAction(
  '[Connections] Reset Connection Test',
);
