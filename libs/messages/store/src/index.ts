import { EnvironmentProviders, Provider } from '@angular/core';
import { provideState } from '@ngrx/store';
import { feature } from './lib/messages.store';
import { provideEffects } from '@ngrx/effects';
import { MessagesEffects } from './lib/messages.effects';

export * from './lib/messages.actions';
export * from './lib/messages.effect-actions';

import * as selectors from './lib/messages.selectors';
export const MessagesSelectors = selectors;

import { MessagesDbEffects } from './lib/messages-db.effects';


export function provideMessagesState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(feature),
    provideEffects([
      MessagesEffects,
      MessagesDbEffects
    ])
  ];
}

