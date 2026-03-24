import { createActionGroup, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const pagesActions = createActionGroup({
  source: 'pages',
  events: {
    'move page': props<{
      id: UUID;
      fromPosition: number;
      newPosition: number;
    }>(),
    'load page order from storage': props<{
      orderOverrides: Record<number, UUID>;
    }>(),
    'close page': props<{ id: UUID; position: number }>(),
  },
});
