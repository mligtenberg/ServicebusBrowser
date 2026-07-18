import { recentPagesActions } from './recent-pages.actions';
import { recentPagesReducer, RecentPagesState } from './recent-pages.store';

describe('recentPagesReducer', () => {
  const baseState: RecentPagesState = { items: [] };

  it('adds a visited page to the front of the list', () => {
    const state = recentPagesReducer(
      baseState,
      recentPagesActions.pageVisited({ title: 'Add Queue', url: '/manage-service-bus/connections/1/queues/add' }),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ title: 'Add Queue', url: '/manage-service-bus/connections/1/queues/add' });
    expect(state.items[0].visitedAt).toEqual(expect.any(Number));
  });

  it('dedupes by url, moving the re-visited entry to the front with its latest title', () => {
    const afterFirst = recentPagesReducer(
      baseState,
      recentPagesActions.pageVisited({ title: 'Edit Queue: orders', url: '/queues/orders' }),
    );
    const afterSecondVisit = recentPagesReducer(
      afterFirst,
      recentPagesActions.pageVisited({ title: 'Send Message', url: '/messages/send' }),
    );
    const afterRevisit = recentPagesReducer(
      afterSecondVisit,
      recentPagesActions.pageVisited({ title: 'Edit Queue: orders', url: '/queues/orders' }),
    );

    expect(afterRevisit.items).toHaveLength(2);
    expect(afterRevisit.items[0].url).toBe('/queues/orders');
    expect(afterRevisit.items[1].url).toBe('/messages/send');
  });

  it('caps the list at 5 entries, dropping the oldest', () => {
    let state = baseState;
    for (let i = 0; i < 6; i++) {
      state = recentPagesReducer(
        state,
        recentPagesActions.pageVisited({ title: `Page ${i}`, url: `/page-${i}` }),
      );
    }

    expect(state.items).toHaveLength(5);
    expect(state.items.map((item) => item.url)).toEqual([
      '/page-5',
      '/page-4',
      '/page-3',
      '/page-2',
      '/page-1',
    ]);
  });

  it('replaces items wholesale on loadFromStorage (workspace switch hydration)', () => {
    const withOneVisit = recentPagesReducer(
      baseState,
      recentPagesActions.pageVisited({ title: 'Add Queue', url: '/queues/add' }),
    );

    const stored = [{ title: 'Other Workspace Page', url: '/other', visitedAt: 123 }];
    const hydrated = recentPagesReducer(
      withOneVisit,
      recentPagesActions.loadFromStorage({ items: stored }),
    );

    expect(hydrated.items).toEqual(stored);
  });
});
