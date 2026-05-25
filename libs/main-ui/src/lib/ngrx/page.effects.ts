import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { pagesActions } from './route.actions';
import { Action, Store } from '@ngrx/store';
import { featureSelector, selectPages } from './route.selectors';
import { mergeMap, tap } from 'rxjs';
import {
  messagePagesActions,
} from '@service-bus-browser/messages-store';
import { WorkspaceService } from '@service-bus-browser/services';

const PAGES_ORDER_KEY = 'pagesOrder';

@Injectable({
  providedIn: 'root',
})
export class PageEffects implements OnInitEffects {
  workspaceService = inject(WorkspaceService);

  ngrxOnInitEffects(): Action {
    const workspaceId = this.workspaceService.activeWorkspace()?.id;
    const pagesOrderJson = localStorage.getItem(PAGES_ORDER_KEY);

    if (pagesOrderJson) {
      const parsed = JSON.parse(pagesOrderJson);

      if (workspaceId) {
        // Detect old format: keys are numeric tab positions, not workspace UUIDs.
        // A UUID always contains hyphens; numeric keys never do.
        const firstKey = Object.keys(parsed)[0];
        const isOldFormat = firstKey !== undefined && !firstKey.includes('-');

        if (isOldFormat) {
          // Migrate: wrap existing mapping under the current workspace id
          const migrated = { [workspaceId]: parsed };
          localStorage.setItem(PAGES_ORDER_KEY, JSON.stringify(migrated));
          return pagesActions.loadPageOrderFromStorage({ orderOverrides: parsed });
        }

        const workspaceOrdering = parsed[workspaceId] ?? {};
        return pagesActions.loadPageOrderFromStorage({ orderOverrides: workspaceOrdering });
      }

      // No workspace yet — fall back to whatever is stored (old or new format)
      return pagesActions.loadPageOrderFromStorage({ orderOverrides: parsed });
    }

    return pagesActions.loadPageOrderFromStorage({
      orderOverrides: {},
    });
  }

  actions = inject(Actions);
  store = inject(Store);
  pages = this.store.selectSignal(selectPages);

  closeMessagePage$ = createEffect(() =>
    this.actions.pipe(
      ofType(pagesActions.closePage),
      mergeMap(({ id }) => {
        const page = this.pages().find((page) => page.id === id);
        switch (page?.type) {
          case 'messages':
            return [messagePagesActions.closePage({ pageId: id })];
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
          const workspaceId = this.workspaceService.activeWorkspace()?.id;
          const currentState = this.store.selectSignal(featureSelector)();
          const existing = JSON.parse(
            localStorage.getItem(PAGES_ORDER_KEY) ?? '{}',
          );

          if (workspaceId) {
            localStorage.setItem(
              PAGES_ORDER_KEY,
              JSON.stringify({ ...existing, [workspaceId]: currentState.pages }),
            );
          } else {
            localStorage.setItem(
              PAGES_ORDER_KEY,
              JSON.stringify(currentState.pages),
            );
          }
        }),
      ),
    { dispatch: false },
  );
}
