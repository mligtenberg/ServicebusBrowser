/**
 * A route's `data.title` may be a plain string, or a function of the
 * route's accumulated params for entries that should include an entity
 * name (e.g. `(params) => `Edit Queue: ${params['queueId']}``).
 */
export type RouteTitle = string | ((params: Record<string, string>) => string);

export type RecentPageItem = {
  title: string;
  url: string;
  visitedAt: number;
};
