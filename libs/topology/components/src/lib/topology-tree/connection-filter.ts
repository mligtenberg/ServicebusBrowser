import { TopologyNode } from '@service-bus-browser/api-contracts';

/**
 * Narrows topology root nodes (each root is a connection) to those whose id is
 * in `filter`. Root node `path` is `/${connectionId}`. An empty/undefined
 * filter means "no restriction" (all roots pass through unchanged).
 */
export function filterRootNodesByConnection(
  roots: TopologyNode[],
  filter: string[] | undefined,
): TopologyNode[] {
  if (!filter || filter.length === 0) {
    return roots;
  }
  const allowed = new Set(filter);
  return roots.filter((root) => allowed.has(root.path.slice(1)));
}
