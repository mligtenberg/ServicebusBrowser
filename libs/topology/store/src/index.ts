import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { topologyFeature } from './lib/topology.store';
import { provideEffects } from '@ngrx/effects';
import { TopologyEffects } from './lib/topology.effects';

export * as TopologySelectors from './lib/topology.selectors'

export function provideTopologyState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(topologyFeature),
    provideEffects([TopologyEffects])
  ];
}
