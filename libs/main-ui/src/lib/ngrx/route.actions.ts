import { createActionGroup, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const pagesActions = createActionGroup({
  source: 'pages',
  events: {
    movePage: props<{
      id: UUID;
      fromPosition: number;
      newPosition: number;
    }>(),
    loadPageOrderFromStorage: props<{
      orderOverrides: Record<number, UUID>;
    }>(),
    closePage: props<{ id: UUID; position: number }>(),
  },
});
