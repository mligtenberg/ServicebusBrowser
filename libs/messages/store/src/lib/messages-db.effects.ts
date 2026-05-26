import { inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { from, map, mergeMap, switchMap } from 'rxjs';
import { messagePagesActions } from './messages.actions';
import { messagePagesEffectActions } from './messages.effect-actions';

@Injectable({
  providedIn: 'root',
})
export class MessagesDbEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return messagePagesEffectActions.loadPagesFromDb();
  }

  store = inject(Store);
  actions$ = inject(Actions);

  // NgRx initializes effects via ENVIRONMENT_INITIALIZER, which runs BEFORE
  // APP_INITIALIZER. The action dispatched by ngrxOnInitEffects therefore
  // fires before the workspace is set up. Each effect awaits
  // getMessagesRepository() inline — its cached promise won't resolve until
  // the workspace initializer calls initializeWorkspace(), so the effect
  // simply queues and emits once everything's ready.
  loadPagesFromDb$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.loadPagesFromDb),
      switchMap(() =>
        from(getMessagesRepository().then((r) => r.getPages())),
      ),
      mergeMap((pages) =>
        pages
          .sort((a, b) => (a.retrievedAt > b.retrievedAt ? 1 : -1))
          .map((page) =>
            messagePagesEffectActions.pageCreated({
              pageId: page.id,
              pageName: page.name,
              disabled: false,
            }),
          ),
      ),
    ),
  );

  closePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesActions.closePage),
      mergeMap(({ pageId }) =>
        from(getMessagesRepository().then((r) => r.closePage(pageId))).pipe(
          map(() => messagePagesEffectActions.pageClosed({ pageId })),
        ),
      ),
    ),
  );

  updatePageName$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagePagesActions.renamePage),
        switchMap(({ pageId, pageName }) =>
          from(
            getMessagesRepository().then((r) =>
              r.updatePageName(pageId, pageName),
            ),
          ),
        ),
      ),
    { dispatch: false },
  );

  reloadAfterWorkspaceSwitch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.workspaceSwitched),
      map(() => messagePagesEffectActions.loadPagesFromDb()),
    ),
  );
}
