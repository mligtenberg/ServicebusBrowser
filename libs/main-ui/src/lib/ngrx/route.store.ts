import { createFeature, createReducer, on } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';

export const featureKey = 'route';

export type RouteState = {
  route: string;
}

export const initialState: RouteState = {
  route: ''
};

export const routeReducer = createReducer(
  initialState,
  on(routerNavigatedAction, (state, { payload }): RouteState => ({
    ...state,
    route: payload.routerState.url
  }))
);

export const routeFeature = createFeature({
  name: featureKey,
  reducer: routeReducer
});

