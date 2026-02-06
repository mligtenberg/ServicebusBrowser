import { createFeature, createReducer, on } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { pagesActions } from './route.actions';

export const featureKey = 'route';

export type RouteState = {
  route: string;
  pages: Record<number, UUID>
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
  on(pagesActions.movePage, (state, { id, fromPosition, newPosition }): RouteState => {
    const moveExistingUp = fromPosition > newPosition;

    let newPages = Object.entries(state.pages)
      .map(([position, pageId]) => ({ position: parseInt(position), pageId }))
      .filter(({ pageId }) => pageId !== id)
      .reduce<Record<number, UUID>>((acc, { position, pageId }) => ({ ...acc, [position]: pageId }), {});


    while (newPages[newPosition] != undefined) {
      const pageAtNewPosition = newPages[newPosition];
      newPages = {
        ...newPages,
        [newPosition]: id,
      }

      id = pageAtNewPosition;
      if (moveExistingUp) {
        newPosition++;
      } else {
        newPosition--;
      }
    }
    newPages = {
      ...newPages,
      [newPosition]: id,
    };

    return {
      ...state,
      pages: newPages
    };
  }),
  on(pagesActions.closePage, (state, { id }): RouteState => ({
    ...state,
    pages: Object.entries(state.pages)
      .filter(([position, pageId]) => pageId !== id)
      .reduce<Record<number, UUID>>((acc, [position, pageId]) => ({ ...acc, [position]: pageId }), {})
  }))
);

export const routeFeature = createFeature({
  name: featureKey,
  reducer: routeReducer
});

