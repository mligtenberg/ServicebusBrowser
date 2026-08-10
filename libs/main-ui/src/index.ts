import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routeFeature } from './lib/ngrx/route.store';
import { recentPagesFeature } from './lib/ngrx/recent-pages.store';
import { RouterEffects } from './lib/ngrx/router.effects';
import { PageEffects } from './lib/ngrx/page.effects';
import { RecentPagesEffects } from './lib/ngrx/recent-pages.effects';

export * from './lib/main-ui/main-ui';
export * from './lib/about/about.component';
export * from './lib/home/home.component';
export { pagesActions } from './lib/ngrx/route.actions';
export { selectActivePage } from './lib/ngrx/route.selectors';
export { recentPagesActions } from './lib/ngrx/recent-pages.actions';
export { selectRecentPages } from './lib/ngrx/recent-pages.selectors';
export type { RecentPageItem } from './lib/ngrx/recent-pages.model';

export function provideMainUi() {
  return [
    provideState(routeFeature),
    provideState(recentPagesFeature),
    provideEffects([RouterEffects, PageEffects, RecentPagesEffects]),
  ]
}
