import { createAction, props } from "@ngrx/store";
import { LogLevel } from "./logging.models";

export const addLog = createAction('[logging] add a new log to the state', props<{message: string, logLevel: LogLevel}>());