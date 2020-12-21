import { createReducer, on } from "@ngrx/store"
import { ILogItem } from "./logging.models"
import * as actions from "./logging.actions"

export interface ILoggingState {
    logItems: ILogItem[];
}

const initialState: ILoggingState = {
    logItems: []
}

export const loggingReducer = createReducer<ILoggingState>(
    initialState,
    on(actions.addLog, (state, action) => {
        return {
            ...state,
            logItems:[
                ...state.logItems,
                {
                    message: action.message,
                    level: action.logLevel
                }
            ]
        }
    })
)