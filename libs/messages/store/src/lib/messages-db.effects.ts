import { inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { from, map, mergeMap, switchMap } from 'rxjs';
import { messagePagesActions } from './messages.actions';
import { messagePagesEffectActions } from './messages.effect-actions';


const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class MessagesDbEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return messagePagesEffectActions.loadPagesFromDb();
  }

  store = inject(Store);
  actions$ = inject(Actions);

  loadPagesFromDb$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.loadPagesFromDb),
      switchMap(() => from(repository.getPages())),
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

  closePage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagePagesActions.closePage),
        switchMap(({ pageId }) => {
          return from(repository.closePage(pageId)).pipe(
            map(() => messagePagesEffectActions.pageClosed({ pageId })),
          );
        }),
      ),
  );

  updatePageName$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagePagesActions.renamePage),
        switchMap(({ pageId, pageName }) =>
          from(repository.updatePageName(pageId, pageName)),
        ),
      ),
    { dispatch: false },
  );
}
