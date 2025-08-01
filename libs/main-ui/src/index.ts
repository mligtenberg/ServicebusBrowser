import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routeFeature } from './lib/ngrx/route.store';
import { RouterEffects } from './lib/ngrx/router.effects';

export * from './lib/main-ui/main-ui';

export function provideMainUi() {
  return [
    provideState(routeFeature),
    provideEffects([RouterEffects]),
  ]
}
