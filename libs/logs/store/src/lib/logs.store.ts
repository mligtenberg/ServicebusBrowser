import { LogLine } from '@service-bus-browser/logs-contracts';
import { createFeature, createReducer, on } from '@ngrx/store';
import { writeLog } from './logs.actions';

export const featureKey = 'logs';

export type LogsState = {
  logs: LogLine[];
}

export const initialState: LogsState = {
  logs: []
};

export const logsReducer = createReducer(
  initialState,
  on(writeLog, (state, { severity, message, context }) => {
    return {
      logs: [...state.logs, {
        severity,
        message,
        context,
        loggedAt: new Date()
      }],
    };
  })
);

export const logsFeature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
