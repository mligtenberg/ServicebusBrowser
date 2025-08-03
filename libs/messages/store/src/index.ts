import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { feature } from './lib/messages.store';
import { provideEffects } from '@ngrx/effects';
import { MessagesEffects } from './lib/messages.effects';
import { MessagesTasksEffects } from './lib/messages-tasks.effects';
import { MessagesLogsEffects } from './lib/messages-logs.effects';

import * as actions from './lib/messages.actions';
import * as selectors from './lib/messages.selectors';
import { MessagesToastsEffects } from './lib/messages-toasts.effects';
export const MessagesActions = actions;
export const MessagesSelectors = selectors;

export function provideMessagesState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(feature),
    provideEffects([
      MessagesEffects,
      MessagesTasksEffects,
      MessagesLogsEffects,
      MessagesToastsEffects
    ]),
  ];
}
