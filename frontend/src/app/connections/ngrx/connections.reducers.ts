import { createReducer, on } from "@ngrx/store";
import { v4 as uuidv4 } from 'uuid';
import * as actions from "./connections.actions";
import { ConnectionType, IConnection } from "./connections.models";

export interface IConnectionsState {
    activeConnections: IConnection[];
    storedConnections: IConnection[];
    selectedConnection: IConnection | null
}

const initialState: IConnectionsState = {
    activeConnections: [],
    storedConnections: [],
    selectedConnection: null
}

export const connectionReducer = createReducer<IConnectionsState>(
    initialState,
    on(actions.createConnection, (state) => {
        return {
            ...state,
            selectedConnection: {
                id: uuidv4(),
                name: '',
                testSuccess: null,
                connectionType: ConnectionType.connectionString,
                connectionDetails: {
                    connectionString: ''
                }
            }
        }
    }),
    on(actions.clearSelectedConnection, (state) => {
        return {
            ...state,
            selectedConnection: null
        }
    }),
    on(actions.selectConnection, (state, action) => {
        return {
            ...state,
            selectedConnection: state.activeConnections.find(c => c.id === action.id) ?? null
        }
    }),
    on(actions.disconnectConnection, (state, action) => {
        return {
            ...state,
            activeConnections: state.activeConnections.filter(c => c.id !== action.id)
        }
    }),
    on(actions.openConnection, (state, action) => {
        return {
            ...state,
            activeConnections: [
                ...state.activeConnections.filter(c => c.id != action.connection.id),
                action.connection
            ]
        }
    }),
    on(actions.connectionsLoadSuccess, (state, action) => {
        return {
            ...state,
            storedConnections: [
                ...action.connections.map(c => {return {...c}})
            ]
        }
    }),
    // selected connections
    on(actions.storeSelectedConnectionSuccess, (state) => {
        return {
            ...state,
            storedConnections: [
                ...state.storedConnections.filter(c => c.id != state.selectedConnection?.id),
                state.selectedConnection
            ],
            selectedConnection: null
        }
    }),
    on(actions.setSelectedConnectionName, (state, action) => {
        if (state.selectedConnection === null) {
            return state;
        }

        return {
            ...state,
            selectedConnection: {
                ...state.selectedConnection,
                name: action.name
            }
        }
    }),
    on(actions.setSelectedConnectionConnectionString, (state, action) => {
        if (state.selectedConnection === null || state.selectedConnection.connectionType !== ConnectionType.connectionString) {
            return state;
        }

        return {
            ...state,
            selectedConnection: {
                ...state.selectedConnection,
                testSuccess: null,
                connectionDetails: {
                    ...state.selectedConnection.connectionDetails,
                    connectionString: action.connectionString
                }
            }
        }
    }),
    on(actions.testConnectionSuccess, (state) => {
        if (state.selectedConnection === null) {
            return state;
        }

        return {
            ...state,
            selectedConnection: {
                ...state.selectedConnection,
                testSuccess: true,
                error: ''
            }
        }
    }),
    on(actions.testConnectionFailed, (state, action) => {
        if (state.selectedConnection === null) {
            return state;
        }

        return {
            ...state,
            selectedConnection: {
                ...state.selectedConnection,
                testSuccess: false,
                error: action.error
            }
        }
    })
)