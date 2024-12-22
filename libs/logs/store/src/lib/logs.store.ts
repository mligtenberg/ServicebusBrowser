import { LogLine, LogLineSeverity } from '@service-bus-browser/logs-contracts';
import { createFeature, createReducer, on } from '@ngrx/store';
import { writeLog } from './logs.actions';

export const featureKey = 'logs';

export type LogsState = {
  logs: LogLine[];
}

export const initialState: LogsState = {
  logs: Array.from({ length: 100000 }, (_, index) => {
    const severity = Math.random();
    let severityString: LogLineSeverity = 'verbose';
    if (severity > 0.2) {
      severityString = 'info';
    }
    if (severity > 0.4) {
      severityString = 'warn';
    }
    if (severity > 0.6) {
      severityString = 'error';
    }
    if (severity > 0.8) {
      severityString = 'critical';
    }

    return {
      loggedAt: new Date(),
      message: `Log message ${index + 1}`,
      severity: severityString
    }
  })
};

export const logsReducer = createReducer(
  initialState,
  on(writeLog, (state, { log }) => {
    return {
      logs: [...state.logs, log]
    };
  })
);

export const logsFeature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
