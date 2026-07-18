import { createActionGroup, props } from '@ngrx/store';
import { RecentPageItem } from './recent-pages.model';

export const recentPagesActions = createActionGroup({
  source: 'recent-pages',
  events: {
    'page visited': props<{ title: string; url: string }>(),
    'load from storage': props<{ items: RecentPageItem[] }>(),
  },
});
