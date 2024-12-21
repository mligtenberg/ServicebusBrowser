import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { logsFeature } from './lib/logs.store';

export * as LogsActions from './lib/logs.actions';
export * as LogsSelectors from './lib/logs.selectors';

export function provideLogsState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(logsFeature),
  ];
}
