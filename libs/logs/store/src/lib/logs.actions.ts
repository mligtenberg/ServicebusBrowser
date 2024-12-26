import { createAction, props } from '@ngrx/store';
import { LogLineSeverity } from '@service-bus-browser/logs-contracts';

export const writeLog = createAction(
  '[Logs] Write a log line',
  props<{
    severity: LogLineSeverity;
    message: string;
    context?: unknown;
  }>()
);
