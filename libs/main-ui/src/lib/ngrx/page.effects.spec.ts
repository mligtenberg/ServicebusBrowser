import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { PageEffects } from './page.effects';
import { pagesActions } from './route.actions';
import { messagePagesActions } from '@service-bus-browser/messages-store';
import { selectPages } from './route.selectors';

describe('PageEffects', () => {
  let effects: PageEffects;
  let store: MockStore;
  let actions$: Observable<Action>;

  const mockPages = [
    { id: 'page-1', type: 'messages', name: 'Page 1', route: '/messages/page/page-1' },
    { id: 'page-2', type: 'messages', name: 'Page 2', route: '/messages/page/page-2' },
    { id: 'page-3', type: 'other', name: 'Page 3', route: '/other/page-3' },
  ] as any[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PageEffects,
        provideMockStore({
          selectors: [
            { selector: selectPages, value: mockPages },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(PageEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('closeMessagePage$', () => {
    it('should dispatch messagePagesActions.closePage when page type is messages', (done) => {
      actions$ = of(pagesActions.closePage({ id: 'page-1', position: 0 }));

      effects.closeMessagePage$.subscribe((action) => {
        expect(action).toEqual(messagePagesActions.closePage({ pageId: 'page-1' }));
        done();
      });
    });

    it('should dispatch messagePagesActions.closePage for second messages page', (done) => {
      actions$ = of(pagesActions.closePage({ id: 'page-2', position: 1 }));

      effects.closeMessagePage$.subscribe((action) => {
        expect(action).toEqual(messagePagesActions.closePage({ pageId: 'page-2' }));
        done();
      });
    });

    it('should not emit anything when page type is not messages', () => {
      actions$ = of(pagesActions.closePage({ id: 'page-3', position: 2 }));

      const results: Action[] = [];
      effects.closeMessagePage$.subscribe((action) => results.push(action));

      expect(results).toHaveLength(0);
    });

    it('should not emit anything when page is not found', () => {
      actions$ = of(pagesActions.closePage({ id: 'non-existent-page', position: 99 }));

      const results: Action[] = [];
      effects.closeMessagePage$.subscribe((action) => results.push(action));

      expect(results).toHaveLength(0);
    });

    it('should process multiple concurrent closePage actions with mergeMap (not cancel previous)', () => {
      // With mergeMap, both synchronous actions should be processed
      // This verifies the switchMap -> mergeMap behavioral change
      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      const results: Action[] = [];
      effects.closeMessagePage$.subscribe((action) => results.push(action));

      actionsSubject.next(pagesActions.closePage({ id: 'page-1', position: 0 }));
      actionsSubject.next(pagesActions.closePage({ id: 'page-2', position: 1 }));

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(messagePagesActions.closePage({ pageId: 'page-1' }));
      expect(results[1]).toEqual(messagePagesActions.closePage({ pageId: 'page-2' }));
    });

    it('should use current pages from store signal when processing the action', (done) => {
      store.overrideSelector(selectPages, [
        { id: 'page-special', type: 'messages', name: 'Special', route: '/messages/page/page-special' },
      ] as any[]);
      store.refreshState();

      actions$ = of(pagesActions.closePage({ id: 'page-special', position: 0 }));

      effects.closeMessagePage$.subscribe((action) => {
        expect(action).toEqual(messagePagesActions.closePage({ pageId: 'page-special' }));
        done();
      });
    });

    it('should not emit for a page that exists but has an unrecognized type', () => {
      store.overrideSelector(selectPages, [
        { id: 'page-unknown', type: 'unknown-type', name: 'Unknown', route: '/other/page-unknown' },
      ] as any[]);
      store.refreshState();

      actions$ = of(pagesActions.closePage({ id: 'page-unknown', position: 0 }));

      const results: Action[] = [];
      effects.closeMessagePage$.subscribe((action) => results.push(action));

      expect(results).toHaveLength(0);
    });
  });
});