import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { WorkspaceService } from '@service-bus-browser/services';
import { MessagesSelectors } from '@service-bus-browser/messages-store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { filter, map, tap } from 'rxjs';
import { pagesActions } from './route.actions';
import { recentPagesActions } from './recent-pages.actions';
import { selectRecentPages } from './recent-pages.selectors';
import { RecentPageItem } from './recent-pages.model';

const RECENT_PAGES_KEY = 'recentPages';

type ResolvedRouteTitle = { title: string } | { messagePageId: string };

/**
 * Walks the matched route tree to the deepest segment carrying a `data.title`
 * (resolved against params accumulated along the way, so e.g. an edit
 * route's title function can read the entity name) or a `data.titleFromMessagePage`
 * flag — used by the message-viewer route, whose display name only exists in
 * the messages store, not the route itself.
 */
function resolveRouteTitle(root: ActivatedRouteSnapshot): ResolvedRouteTitle | undefined {
  let route: ActivatedRouteSnapshot | undefined = root;
  let params: Record<string, string> = {};
  let resolved: ResolvedRouteTitle | undefined;

  while (route) {
    params = { ...params, ...route.params };
    const routeTitle = route.data['title'];
    if (typeof routeTitle === 'function') {
      resolved = { title: routeTitle(params) };
    } else if (typeof routeTitle === 'string') {
      resolved = { title: routeTitle };
    } else if (route.data['titleFromMessagePage']) {
      resolved = { messagePageId: params['pageId'] };
    }
    route = route.firstChild ?? undefined;
  }

  return resolved;
}

function isRecentPageItem(item: unknown): item is RecentPageItem {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof (item as RecentPageItem).title === 'string' &&
    typeof (item as RecentPageItem).url === 'string' &&
    typeof (item as RecentPageItem).visitedAt === 'number'
  );
}

function readStoredRecentPagesByWorkspace(): Record<string, unknown> {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_PAGES_KEY) ?? '{}');
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

@Injectable({
  providedIn: 'root',
})
export class RecentPagesEffects {
  actions = inject(Actions);
  store = inject(Store);
  workspaceService = inject(WorkspaceService);

  loadRecentPages$ = createEffect(() =>
    this.actions.pipe(
      ofType(pagesActions.workspaceActivated),
      map(({ workspaceId }) => {
        const stored = readStoredRecentPagesByWorkspace()[workspaceId];
        const items = Array.isArray(stored) ? stored.filter(isRecentPageItem) : [];
        return recentPagesActions.loadFromStorage({ items });
      }),
    ),
  );

  recordVisit$ = createEffect(() =>
    this.actions.pipe(
      ofType(routerNavigatedAction),
      map(({ payload }) => {
        const { url } = payload.routerState;
        if (url.startsWith('/popups')) {
          return null;
        }

        const resolved = resolveRouteTitle(payload.routerState.root);
        if (!resolved) {
          return null;
        }

        if ('title' in resolved) {
          return recentPagesActions.pageVisited({ title: resolved.title, url });
        }

        const page = this.store.selectSignal(
          MessagesSelectors.selectPage(resolved.messagePageId as UUID),
        )();
        return page
          ? recentPagesActions.pageVisited({ title: `View Messages: ${page.name}`, url })
          : null;
      }),
      filter(
        (action): action is ReturnType<typeof recentPagesActions.pageVisited> =>
          action !== null,
      ),
    ),
  );

  removeClosedPage$ = createEffect(() =>
    this.actions.pipe(
      ofType(pagesActions.closePage),
      map(({ id }) =>
        recentPagesActions.pageRemoved({
          url: this.workspaceService.workspaceUrl(`/messages/page/${id}`),
        }),
      ),
    ),
  );

  persistRecentPages$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(recentPagesActions.pageVisited, recentPagesActions.pageRemoved),
        tap(() => {
          const workspaceId = this.workspaceService.activeWorkspace()?.id;
          if (!workspaceId) {
            return;
          }

          const items = this.store.selectSignal(selectRecentPages)();
          localStorage.setItem(
            RECENT_PAGES_KEY,
            JSON.stringify({
              ...readStoredRecentPagesByWorkspace(),
              [workspaceId]: items,
            }),
          );
        }),
      ),
    { dispatch: false },
  );
}
