import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, RouteState } from './route.store';
import { MessagesSelectors } from '@service-bus-browser/messages-store';

const featureSelector = createFeatureSelector<RouteState>(featureKey);

export const selectRoute = createSelector(
  featureSelector,
  (state) => state.route
);

export const selectPages = createSelector(
  featureSelector,
  MessagesSelectors.selectPages,
  (state, messagePages) => {
    const positions = state.pages.sort(p => p.position);
    const pagesBase = [...messagePages].map((page) => ({
      ...page,
      position: positions.find((p) => p.pageId === page.id)?.position,
      route: '/messages/page.ts/' + page.id
    }));

    let pages = pagesBase.filter(p => !p.position);
    const pagesToInsert = pagesBase.filter(p => p.position);

    for (const page of pagesToInsert) {
      if (page.position === 0) {
        pages = [
          page,
          ...pagesBase
        ]
        continue;
      }

      pages = [
        ...pagesBase.slice(0, (page.position ?? 1) - 1),
        page,
        ...pagesBase.slice(page.position),
      ]
    }

    return pages;
  }
);

export const selectActivePage = createSelector(
  featureSelector,
  selectPages,
  (state, pages) => pages.find(p => p.route === state.route)
)
