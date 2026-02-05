import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pagesActions } from './route.actions';
import { Store } from '@ngrx/store';
import { selectPages } from './route.selectors';
import { switchMap } from 'rxjs';
import { MessagesActions } from '@service-bus-browser/messages-store';

@Injectable({
  providedIn: 'root',
})
export class PageEffects {
  actions = inject(Actions);
  store = inject(Store);
  pages = this.store.selectSignal(selectPages);

  closeMessagePage$ = createEffect(() => this.actions.pipe(
    ofType(pagesActions.closePage),
    switchMap(({ id }) => {
      const page = this.pages().find(page => page.id === id);
      switch (page?.type) {
        case 'messages':
          return [MessagesActions.closePage({ pageId: id })];
      }

      return [];
    })
  ));
}
