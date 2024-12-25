import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { connectionsFeature } from './lib/connections.store';
import { provideEffects } from '@ngrx/effects';
import { ConnectionsEffects } from './lib/connections.effects';

export * as ConnectionsActions from './lib/connections.actions';
export * as ConnectionsSelectors from './lib/connections.selectors';

export function provideConnectionsState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(connectionsFeature),
    provideEffects([ConnectionsEffects]),
  ];
}
