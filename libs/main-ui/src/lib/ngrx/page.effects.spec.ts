import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { WorkspaceService } from '@service-bus-browser/services';
import { PageEffects } from './page.effects';
import { pagesActions } from './route.actions';
import { featureSelector, selectPages } from './route.selectors';

const PAGES_ORDER_KEY = 'pagesOrder';
const WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

describe('PageEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: PageEffects;
  let store: MockStore;

  beforeEach(() => {
    localStorage.clear();
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        PageEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectPages, value: [] },
            {
              selector: featureSelector,
              value: { route: '', pages: {}, activePageId: undefined },
            },
          ],
        }),
        {
          provide: WorkspaceService,
          useValue: { activeWorkspace: signal({ id: WORKSPACE_ID }) },
        },
      ],
    });

    effects = TestBed.inject(PageEffects);
    store = TestBed.inject(MockStore);
  });

  describe('loadPageOrder$', () => {
    it('loads the active workspace order from new-format storage', async () => {
      localStorage.setItem(
        PAGES_ORDER_KEY,
        JSON.stringify({
          [WORKSPACE_ID]: { 0: 'page-a', 1: 'page-b' },
          'other-workspace-id': { 0: 'page-c' },
        }),
      );

      actions$.next(
        pagesActions.workspaceActivated({ workspaceId: WORKSPACE_ID }),
      );

      await expect(firstValueFrom(effects.loadPageOrder$)).resolves.toEqual(
        pagesActions.loadPageOrderFromStorage({
          orderOverrides: { 0: 'page-a', 1: 'page-b' },
        }),
      );
    });

    it('loads an empty order when nothing is stored for the workspace', async () => {
      localStorage.setItem(
        PAGES_ORDER_KEY,
        JSON.stringify({ 'other-workspace-id': { 0: 'page-c' } }),
      );

      actions$.next(
        pagesActions.workspaceActivated({ workspaceId: WORKSPACE_ID }),
      );

      await expect(firstValueFrom(effects.loadPageOrder$)).resolves.toEqual(
        pagesActions.loadPageOrderFromStorage({ orderOverrides: {} }),
      );
    });

    it('migrates old-format storage (numeric keys) under the workspace id', async () => {
      localStorage.setItem(
        PAGES_ORDER_KEY,
        JSON.stringify({ 0: 'page-a', 1: 'page-b' }),
      );

      actions$.next(
        pagesActions.workspaceActivated({ workspaceId: WORKSPACE_ID }),
      );

      await expect(firstValueFrom(effects.loadPageOrder$)).resolves.toEqual(
        pagesActions.loadPageOrderFromStorage({
          orderOverrides: { 0: 'page-a', 1: 'page-b' },
        }),
      );
      expect(JSON.parse(localStorage.getItem(PAGES_ORDER_KEY) ?? '')).toEqual({
        [WORKSPACE_ID]: { 0: 'page-a', 1: 'page-b' },
      });
    });

    it('drops corrupted entries (non-numeric positions, non-string page ids)', async () => {
      localStorage.setItem(
        PAGES_ORDER_KEY,
        JSON.stringify({
          [WORKSPACE_ID]: {
            0: 'page-a',
            'not-a-position': 'page-b',
            1: { nested: 'garbage' },
          },
        }),
      );

      actions$.next(
        pagesActions.workspaceActivated({ workspaceId: WORKSPACE_ID }),
      );

      await expect(firstValueFrom(effects.loadPageOrder$)).resolves.toEqual(
        pagesActions.loadPageOrderFromStorage({
          orderOverrides: { 0: 'page-a' },
        }),
      );
    });

    it('loads an empty order when storage contains invalid JSON', async () => {
      localStorage.setItem(PAGES_ORDER_KEY, 'not-json{');

      actions$.next(
        pagesActions.workspaceActivated({ workspaceId: WORKSPACE_ID }),
      );

      await expect(firstValueFrom(effects.loadPageOrder$)).resolves.toEqual(
        pagesActions.loadPageOrderFromStorage({ orderOverrides: {} }),
      );
    });
  });

  describe('storePageOrder$', () => {
    beforeEach(() => {
      store.overrideSelector(featureSelector, {
        route: '',
        pages: { 0: 'page-b', 1: 'page-a' },
        activePageId: undefined,
      });
    });

    it('persists the order under the active workspace id on movePage', async () => {
      const subscription = effects.storePageOrder$.subscribe();
      actions$.next(
        pagesActions.movePage({ id: 'page-a', fromPosition: 0, newPosition: 1 }),
      );
      subscription.unsubscribe();

      expect(JSON.parse(localStorage.getItem(PAGES_ORDER_KEY) ?? '')).toEqual({
        [WORKSPACE_ID]: { 0: 'page-b', 1: 'page-a' },
      });
    });

    it('persists the order on closePage', async () => {
      const subscription = effects.storePageOrder$.subscribe();
      actions$.next(pagesActions.closePage({ id: 'page-c', position: 2 }));
      subscription.unsubscribe();

      expect(JSON.parse(localStorage.getItem(PAGES_ORDER_KEY) ?? '')).toEqual({
        [WORKSPACE_ID]: { 0: 'page-b', 1: 'page-a' },
      });
    });

    it('preserves stored orders of other workspaces', async () => {
      localStorage.setItem(
        PAGES_ORDER_KEY,
        JSON.stringify({ 'other-workspace-id': { 0: 'page-c' } }),
      );

      const subscription = effects.storePageOrder$.subscribe();
      actions$.next(
        pagesActions.movePage({ id: 'page-a', fromPosition: 0, newPosition: 1 }),
      );
      subscription.unsubscribe();

      expect(JSON.parse(localStorage.getItem(PAGES_ORDER_KEY) ?? '')).toEqual({
        'other-workspace-id': { 0: 'page-c' },
        [WORKSPACE_ID]: { 0: 'page-b', 1: 'page-a' },
      });
    });
  });
});
