import { TopologyNode } from '@service-bus-browser/api-contracts';
import { filterRootNodesByConnection } from './connection-filter';

function connectionNode(connectionId: string): TopologyNode {
  return {
    type: 'connection',
    selectable: false,
    path: `/${connectionId}`,
    name: connectionId,
    refreshable: true,
  };
}

describe('filterRootNodesByConnection', () => {
  const connectionA = connectionNode('connection-a');
  const connectionB = connectionNode('connection-b');
  const roots = [connectionA, connectionB];

  it('returns all roots unchanged when filter is undefined', () => {
    expect(filterRootNodesByConnection(roots, undefined)).toBe(roots);
  });

  it('returns all roots unchanged when filter is empty', () => {
    expect(filterRootNodesByConnection(roots, [])).toBe(roots);
  });

  it('keeps only roots whose connection id is in the filter', () => {
    expect(filterRootNodesByConnection(roots, ['connection-a'])).toEqual([
      connectionA,
    ]);
  });

  it('supports multiple allowed connection ids', () => {
    expect(
      filterRootNodesByConnection(roots, ['connection-a', 'connection-b']),
    ).toEqual([connectionA, connectionB]);
  });

  it('excludes all roots when the filter matches none of them', () => {
    expect(filterRootNodesByConnection(roots, ['connection-c'])).toEqual([]);
  });
});
