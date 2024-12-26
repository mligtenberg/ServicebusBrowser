import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogLineSeverity } from '@service-bus-browser/logs-contracts';
import { LogsActions } from '@service-bus-browser/logs-store';

@Injectable({
  providedIn: 'root'
})
export class Logger {
  store = inject(Store);

  log(message: string, severity: LogLineSeverity, context?: unknown) {
    this.store.dispatch(LogsActions.writeLog({
      context,
      message,
      severity
    }));
  }

  verbose(message: string, context?: unknown) {
    this.log(message, 'verbose', context);
  }

  info(message: string, context?: unknown) {
    this.log(message, 'info', context);
  }

  warn(message: string, context?: unknown) {
    this.log(message, 'warn', context);
  }

  error(message: string, context?: unknown) {
    this.log(message, 'error', context);
  }

  critical(message: string, context?: unknown) {
    this.log(message, 'critical', context);
  }
}
