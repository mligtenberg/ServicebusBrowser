import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../ngrx.module';
import { addLog } from './ngrx/logging.actions';
import { LogLevel } from './ngrx/logging.models';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private store: Store<State>) { }

  logVerbose(message: string) {
    this.store.dispatch(addLog({message, logLevel: LogLevel.verbose}));
  }

  logInfo(message: string) {
    this.store.dispatch(addLog({message, logLevel: LogLevel.info}));
  }

  logWarning(message: string) {
    this.store.dispatch(addLog({message, logLevel: LogLevel.warning}));
  }

  logError(message: string) {
    this.store.dispatch(addLog({message, logLevel: LogLevel.error}));
  }
}
