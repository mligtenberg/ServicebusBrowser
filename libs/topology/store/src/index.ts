import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { topologyFeature } from './lib/topology.store';
import { provideEffects } from '@ngrx/effects';
import { TopologyLoggingEffects } from './lib/topology-logging.effects';
import { TopologyNamespacesEffects } from './lib/topology-namespaces.effects';
import { TopologyQueueEffects } from './lib/topology-queue.effects';
import { TopologyTopicEffects } from './lib/topology-topic.effects';
import { TopologySubscriptionEffects } from './lib/topology-subscription.effects';
import { TopologyToastsEffects } from './lib/topology-toasts.effects';

export * as TopologyActions from './lib/topology.actions'
export * as TopologySelectors from './lib/topology.selectors'

export function provideTopologyState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(topologyFeature),
    provideEffects([
      TopologyNamespacesEffects,
      TopologyQueueEffects,
      TopologyTopicEffects,
      TopologySubscriptionEffects,
      TopologyLoggingEffects,
      TopologyToastsEffects
    ])
  ];
}
