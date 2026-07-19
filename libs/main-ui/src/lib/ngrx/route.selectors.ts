import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, RouteState } from './route.store';
import { MessagesSelectors } from '@service-bus-browser/messages-store';

export const featureSelector = createFeatureSelector<RouteState>(featureKey);

export const selectRoute = createSelector(
  featureSelector,
  (state) => state.route
);

export const selectPages = createSelector(
  featureSelector,
  MessagesSelectors.selectPages,
  (state, messagePages) => {
    // `state.route` is the raw router URL, `/<workspaceId>/messages/...` —
    // reusing its own workspace segment keeps this comparable to
    // `state.route` in selectActivePage without a separate workspace lookup.
    const workspaceSegment = state.route.split('/')[1];
    const workspacePrefix = workspaceSegment ? `/${workspaceSegment}` : '';

    const positions = Object.entries(state.pages)
      .map(([position, pageId]) => ({pageId, position: parseInt(position)}))
      .sort(p => p.position);
    const pagesBase = [...messagePages].map((page) => ({
      ...page,
      position: positions.find((p) => p.pageId === page.id)?.position,
      route: `${workspacePrefix}/messages/page/${page.id}`
    }));

    let pages = pagesBase.filter(p => p.position === undefined);
    const pagesToInsert = pagesBase.filter(p => p.position !== undefined);

    for (const page of pagesToInsert) {
      if (page.position === 0) {
        pages = [page, ...pages];
        continue;
      }

      pages = [
        ...pages.slice(0, page.position ?? 0),
        page,
        ...pages.slice(page.position ?? 0),
      ];
    }

    return pages;
  }
);

export const selectActivePage = createSelector(
  featureSelector,
  selectPages,
  (state, pages) => pages.find(p => p.route === state.route)
)
