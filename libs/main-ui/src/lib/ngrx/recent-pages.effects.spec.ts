import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { WorkspaceService } from '@service-bus-browser/services';
import { RecentPagesEffects } from './recent-pages.effects';
import { recentPagesActions } from './recent-pages.actions';
import { pagesActions } from './route.actions';

describe('RecentPagesEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: RecentPagesEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        RecentPagesEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: WorkspaceService, useValue: { activeWorkspace: () => undefined } },
      ],
    });

    effects = TestBed.inject(RecentPagesEffects);
  });

  describe('removeClosedPage$', () => {
    it('dispatches pageRemoved for the closed page\'s message-viewer url', async () => {
      actions$.next(pagesActions.closePage({ id: 'page-1', position: 0 }));

      await expect(firstValueFrom(effects.removeClosedPage$)).resolves.toEqual(
        recentPagesActions.pageRemoved({ url: '/messages/page/page-1' }),
      );
    });
  });
});
