import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject } from 'rxjs';
import { Action } from '@ngrx/store';

// Mock must be defined before importing the effects (jest.mock is hoisted)
const mockClosePage = jest.fn();
const mockGetPages = jest.fn();
const mockRepository = {
  closePage: mockClosePage,
  getPages: mockGetPages,
  addPage: jest.fn(),
  updatePageName: jest.fn(),
};

jest.mock('@service-bus-browser/messages-db', () => ({
  getMessagesRepository: jest.fn().mockResolvedValue(mockRepository),
}));

// Import effects AFTER the mock is set up
import { MessagesDbEffects } from './messages-db.effects';
import { messagePagesActions } from './messages.actions';
import { messagePagesEffectActions } from './messages.effect-actions';

describe('MessagesDbEffects', () => {
  let effects: MessagesDbEffects;
  let actions$: Observable<Action>;

  beforeEach(async () => {
    mockClosePage.mockReset();
    mockGetPages.mockReset();
    mockClosePage.mockResolvedValue(undefined);
    mockGetPages.mockResolvedValue([]);

    await TestBed.configureTestingModule({
      providers: [
        MessagesDbEffects,
        provideMockActions(() => actions$),
      ],
    }).compileComponents();

    effects = TestBed.inject(MessagesDbEffects);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('closePage$', () => {
    it('should dispatch pageClosed action after repository.closePage resolves', (done) => {
      mockClosePage.mockResolvedValue(undefined);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      effects.closePage$.subscribe((action) => {
        expect(action).toEqual(messagePagesEffectActions.pageClosed({ pageId: 'page-1' }));
        done();
      });

      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-1' }));
    });

    it('should dispatch pageClosed with the correct pageId', (done) => {
      mockClosePage.mockResolvedValue(undefined);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      effects.closePage$.subscribe((action) => {
        expect(action).toEqual(
          messagePagesEffectActions.pageClosed({ pageId: 'specific-page-id-123' })
        );
        done();
      });

      actionsSubject.next(messagePagesActions.closePage({ pageId: 'specific-page-id-123' }));
    });

    it('should call repository.closePage with the pageId from the action', (done) => {
      mockClosePage.mockResolvedValue(undefined);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      effects.closePage$.subscribe(() => {
        expect(mockClosePage).toHaveBeenCalledWith('page-42');
        done();
      });

      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-42' }));
    });

    it('should call repository.closePage exactly once per action', (done) => {
      mockClosePage.mockResolvedValue(undefined);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      effects.closePage$.subscribe(() => {
        expect(mockClosePage).toHaveBeenCalledTimes(1);
        done();
      });

      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-once' }));
    });

    it('should process multiple concurrent closePage actions with mergeMap (not cancel previous)', (done) => {
      // With mergeMap, all concurrent closePage actions are processed
      // This verifies the switchMap -> mergeMap behavioral change:
      // switchMap would cancel the first action when the second arrives
      let resolveFirst!: () => void;
      let resolveSecond!: () => void;

      const firstClosePromise = new Promise<void>((res) => { resolveFirst = res; });
      const secondClosePromise = new Promise<void>((res) => { resolveSecond = res; });

      mockClosePage
        .mockReturnValueOnce(firstClosePromise)
        .mockReturnValueOnce(secondClosePromise);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      const results: Action[] = [];
      effects.closePage$.subscribe((action) => {
        results.push(action);
        if (results.length === 2) {
          expect(results).toContainEqual(
            messagePagesEffectActions.pageClosed({ pageId: 'page-a' })
          );
          expect(results).toContainEqual(
            messagePagesEffectActions.pageClosed({ pageId: 'page-b' })
          );
          done();
        }
      });

      // Dispatch two actions before either resolves - with mergeMap both are processed
      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-a' }));
      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-b' }));

      // Resolve in reverse order to confirm both are handled independently
      resolveSecond();
      resolveFirst();
    });

    it('should handle three sequential closePage actions and emit pageClosed for each', (done) => {
      mockClosePage.mockResolvedValue(undefined);

      const actionsSubject = new Subject<Action>();
      actions$ = actionsSubject.asObservable();

      const results: Action[] = [];
      effects.closePage$.subscribe((action) => {
        results.push(action);
        if (results.length === 3) {
          expect(results).toContainEqual(
            messagePagesEffectActions.pageClosed({ pageId: 'page-1' })
          );
          expect(results).toContainEqual(
            messagePagesEffectActions.pageClosed({ pageId: 'page-2' })
          );
          expect(results).toContainEqual(
            messagePagesEffectActions.pageClosed({ pageId: 'page-3' })
          );
          done();
        }
      });

      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-1' }));
      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-2' }));
      actionsSubject.next(messagePagesActions.closePage({ pageId: 'page-3' }));
    });
  });
});
