import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { topologyFeature } from './lib/topology.store';

import * as actions from './lib/topology.actions'
import * as selectors from './lib/topology.selectors'
import { provideEffects } from '@ngrx/effects';
import { TopologyEffects } from './lib/topology.effects';
import { TopologyLoggingEffects } from './lib/topology-logging.effects';

// some IDEs do not understand the export * as x from 'y' syntax
export const TopologyActions = actions;
export const TopologySelectors = selectors;

export function provideTopologyState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(topologyFeature),
    provideEffects([
      TopologyEffects,
      TopologyLoggingEffects
    ])
  ];
}
