import { createAction, props } from '@ngrx/store';
import { LogLine } from '@service-bus-browser/logs-contracts';

export const writeLog = createAction(
  '[Logs] Write a log line',
  props<{ log: LogLine }>()
);
