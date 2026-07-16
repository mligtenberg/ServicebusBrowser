import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pagesActions } from './route.actions';
import { Store } from '@ngrx/store';
import { featureSelector, selectPages } from './route.selectors';
import { map, mergeMap, tap } from 'rxjs';
import {
  messagePagesActions,
} from '@service-bus-browser/messages-store';
import { WorkspaceService } from '@service-bus-browser/services';
import { UUID } from '@service-bus-browser/shared-contracts';

const PAGES_ORDER_KEY = 'pagesOrder';

/**
 * Drops entries that don't map a numeric tab position to a page id, so
 * previously corrupted storage (e.g. workspace-keyed wrapper objects that
 * leaked in as positions) can't poison the route state.
 */
function sanitizeOrder(order: unknown): Record<number, UUID> {
  if (order === null || typeof order !== 'object') {
    return {};
  }

  return Object.entries(order)
    .filter(
      ([position, pageId]) =>
        /^\d+$/.test(position) && typeof pageId === 'string',
    )
    .reduce<Record<number, UUID>>(
      (acc, [position, pageId]) => ({
        ...acc,
        [parseInt(position)]: pageId as UUID,
      }),
      {},
    );
}

function readStoredOrders(): Record<string, unknown> {
  try {
    const parsed = JSON.parse(localStorage.getItem(PAGES_ORDER_KEY) ?? '{}');
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

@Injectable({
  providedIn: 'root',
})
export class PageEffects {
  workspaceService = inject(WorkspaceService);

  actions = inject(Actions);
  store = inject(Store);
  pages = this.store.selectSignal(selectPages);

  loadPageOrder$ = createEffect(() =>
    this.actions.pipe(
      ofType(pagesActions.workspaceActivated),
      map(({ workspaceId }) => {
        const stored = readStoredOrders();

        // Detect old format: keys are numeric tab positions, not workspace
        // UUIDs. A UUID always contains hyphens; numeric keys never do.
        const firstKey = Object.keys(stored)[0];
        const isOldFormat = firstKey !== undefined && !firstKey.includes('-');

        if (isOldFormat) {
          // Migrate: wrap existing mapping under the current workspace id
          localStorage.setItem(
            PAGES_ORDER_KEY,
            JSON.stringify({ [workspaceId]: stored }),
          );
          return pagesActions.loadPageOrderFromStorage({
            orderOverrides: sanitizeOrder(stored),
          });
        }

        return pagesActions.loadPageOrderFromStorage({
          orderOverrides: sanitizeOrder(stored[workspaceId]),
        });
      }),
    ),
  );

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
        ofType(pagesActions.movePage, pagesActions.closePage),
        tap(() => {
          const workspaceId = this.workspaceService.activeWorkspace()?.id;
          if (!workspaceId) {
            return;
          }

          const currentState = this.store.selectSignal(featureSelector)();
          localStorage.setItem(
            PAGES_ORDER_KEY,
            JSON.stringify({
              ...readStoredOrders(),
              [workspaceId]: currentState.pages,
            }),
          );
        }),
      ),
    { dispatch: false },
  );
}
