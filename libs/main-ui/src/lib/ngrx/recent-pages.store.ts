import { createFeature, createReducer, on } from '@ngrx/store';
import { recentPagesActions } from './recent-pages.actions';
import { RecentPageItem } from './recent-pages.model';

export const featureKey = 'recentPages';

const MAX_RECENT_PAGES = 5;

export type RecentPagesState = {
  items: RecentPageItem[];
};

// Recent pages are scoped per workspace (loaded via
// recentPagesActions.loadFromStorage once the active workspace is known —
// see RecentPagesEffects), so there's nothing to read from storage yet here.
export const initialState: RecentPagesState = {
  items: [],
};

export const recentPagesReducer = createReducer(
  initialState,
  on(recentPagesActions.pageVisited, (state, { title, url }): RecentPagesState => ({
    ...state,
    items: [
      { title, url, visitedAt: Date.now() },
      ...state.items.filter((item) => item.url !== url),
    ].slice(0, MAX_RECENT_PAGES),
  })),
  on(recentPagesActions.pageRemoved, (state, { url }): RecentPagesState => ({
    ...state,
    items: state.items.filter((item) => item.url !== url),
  })),
  on(recentPagesActions.loadFromStorage, (state, { items }): RecentPagesState => ({
    ...state,
    items,
  })),
);

export const recentPagesFeature = createFeature({
  name: featureKey,
  reducer: recentPagesReducer,
});
