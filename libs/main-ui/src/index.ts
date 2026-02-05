import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routeFeature } from './lib/ngrx/route.store';
import { RouterEffects } from './lib/ngrx/router.effects';
import { PageEffects } from './lib/ngrx/page.effects';

export * from './lib/main-ui/main-ui';
export * from './lib/about/about.component';

export function provideMainUi() {
  return [
    provideState(routeFeature),
    provideEffects([RouterEffects, PageEffects]),
  ]
}
