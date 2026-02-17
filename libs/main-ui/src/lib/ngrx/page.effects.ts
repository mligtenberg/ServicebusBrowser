import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { pagesActions } from './route.actions';
import { Action, Store } from '@ngrx/store';
import { featureSelector, selectPages } from './route.selectors';
import { switchMap, tap } from 'rxjs';
import { MessagesActions } from '@service-bus-browser/messages-store';

@Injectable({
  providedIn: 'root',
})
export class PageEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    const pagesOrderJson = localStorage.getItem('pagesOrder');
    if (pagesOrderJson) {
      return pagesActions.loadPageOrderFromStorage({
        orderOverrides: JSON.parse(pagesOrderJson),
      });
    }

    return pagesActions.loadPageOrderFromStorage({
      orderOverrides: {}
    })
  }

  actions = inject(Actions);
  store = inject(Store);
  pages = this.store.selectSignal(selectPages);

  closeMessagePage$ = createEffect(() =>
    this.actions.pipe(
      ofType(pagesActions.closePage),
      switchMap(({ id }) => {
        const page = this.pages().find((page) => page.id === id);
        switch (page?.type) {
          case 'messages':
            return [MessagesActions.closePage({ pageId: id })];
        }

        return [];
      }),
    ),
  );

  storePageOrder$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(pagesActions.movePage),
        tap(() => {
          const currentState = this.store.selectSignal(featureSelector)();
          localStorage.setItem(
            'pagesOrder',
            JSON.stringify(currentState.pages),
          );
        }),
      ),
    { dispatch: false },
  );
}
