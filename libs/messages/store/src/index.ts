import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { feature } from './lib/messages.store';
import { provideEffects } from '@ngrx/effects';
import { MessagesEffects } from './lib/messages.effects';
import { MessagesTasksEffects } from './lib/messages-tasks.effects';
import { MessagesLogsEffects } from './lib/messages-logs.effects';

export * as MessagesActions from './lib/messages.actions';
export * as MessagesSelectors from './lib/messages.selectors';

export function provideMessagesState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(feature),
    provideEffects([
      MessagesEffects,
      MessagesTasksEffects,
      MessagesLogsEffects
    ])
  ];
}
