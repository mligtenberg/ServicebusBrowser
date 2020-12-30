import { createReducer, on } from "@ngrx/store";
import { v4 as uuidv4 } from 'uuid';
import * as actions from "./connections.actions";
import { ConnectionType, IConnection } from "./connections.models";
import * as _ from 'lodash';

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
                },
                isNew: true
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
    on(actions.deleteConnectionSuccess, (state, action) => {
        return {
            ...state,
            storedConnections: [
                ...state.storedConnections.filter(c => c.id !== action.id)
            ],
            activeConnections: [
                ...state.activeConnections.filter(c => c.id !== action.id)
            ]
        }
    }),
    // selected connections
    on(actions.openSelectedConnection, (state) => {
        return {
            ...state,
            selectedConnection: null,
            activeConnections: [
                ...state.activeConnections.filter(c => !c.id || c.id != state.selectedConnection.id),
                {
                    ...state.selectedConnection,
                    isNew: false
                }
            ]
        }
    }),
    on(actions.storeSelectedConnectionSuccess, (state) => {
        return {
            ...state,
            storedConnections: [
                ...state.storedConnections.filter(c => c.id != state.selectedConnection?.id),
                {
                    ...state.selectedConnection,
                    isNew: false
                }
            ]
        }
    }),
    on(actions.updateSelectedConnection, (state, action) => {
        if (state.selectedConnection === null) {
            return state;
        }

        return {
            ...state,
            selectedConnection: {
                ...state.selectedConnection,
                name: action.connection.name,
                connectionDetails: action.connection.connectionDetails,
                connectionType: action.connection.connectionType,
                testSuccess: state.selectedConnection.testSuccess && _.isEqual(state.selectedConnection.connectionDetails, action.connection.connectionDetails)
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