import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { feature } from './lib/tasks.store';

export * as TasksActions from './lib/tasks.actions'
export * as TasksSelectors from './lib/tasks.selectors'

export function provideTasksState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(feature),
    // provideEffects([
    //   TopologyNamespacesEffects,
    //   TopologyQueueEffects,
    //   TopologyTopicEffects,
    //   TopologySubscriptionEffects,
    //   TopologySubscriptionRuleEffects,
    //   TopologyLoggingEffects,
    //   TopologyToastsEffects
    // ])
  ];
}
