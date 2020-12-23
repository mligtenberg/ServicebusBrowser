import { createAction, props } from "@ngrx/store";
import { IConnection } from "./connections.models";

// basic connection operations
export const createConnection = createAction('[Connection] create a empty connection and load it as selected');
export const selectConnection = createAction('[connection] load an exsiting connection as selected', props<{id: string}>());
export const disconnectConnection = createAction('[connection] disconnect from a connection', props<{id: string}>());
export const deleteConnection = createAction('[Connection] Delete a specified connection', props<{id: string}>());
export const openConnection = createAction('[Connection] Open a connection', props<{connection: IConnection}>())
export const connectionsLoad = createAction('[Connection] Load stored connections from storage')
export const connectionsLoadSuccess = createAction('[Connection] Stored connections are loaded from storage', props<{connections: IConnection[]}>())

// selected connection operations
export const storeSelectedConnection = createAction('[Connection/Selected] store the selected connection');
export const storeSelectedConnectionSuccess = createAction('[Connection/Selected] storing the selected component succeeded');
export const storeSelectedConnectionFailed = createAction('[Connection/Selected] storing the selected component failed', props<{error: string}>());

export const clearSelectedConnection = createAction('[Connection/Selected] clear the currently selected connection');

export const setSelectedConnectionName = createAction('[Connection/Selected] Set the name of the selected connection', props<{name: string}>());
export const setSelectedConnectionConnectionString = createAction('[Connection/Selected] Set the connection string of the selected connection', props<{connectionString: string}>());

export const testConnection = createAction('[Connection/Selected] Test a given connection');
export const testConnectionFailed = createAction('[Connection/Selected] Test of given connection failed', props<{error: string}>());
export const testConnectionSuccess = createAction('[Connection/Selected] Test of given connection success');