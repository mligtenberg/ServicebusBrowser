import { createFeature, createReducer, on } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { pagesActions } from './route.actions';

export const featureKey = 'route';

export type RouteState = {
  route: string;
  pages: { pageId: UUID; position: number; name: string }[];
  activePageId: UUID | undefined;
};

export const initialState: RouteState = {
  route: '',
  pages: [],
  activePageId: undefined
};

export const routeReducer = createReducer(
  initialState,
  on(routerNavigatedAction, (state, { payload }): RouteState => ({
    ...state,
    route: payload.routerState.url,
    activePageId: undefined
  })),
);

export const routeFeature = createFeature({
  name: featureKey,
  reducer: routeReducer
});

