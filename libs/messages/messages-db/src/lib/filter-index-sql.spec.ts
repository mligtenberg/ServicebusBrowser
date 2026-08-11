import { MessageFilter } from '@service-bus-browser/filtering';
import {
  FILTER_INDEX_TABLE,
  buildFilterIndexPageQuery,
  buildFilterIndexStatements,
  filterIndexSignature,
} from './filter-index-sql';

const emptyFilter: MessageFilter = {
  body: [],
  headers: [],
  properties: [],
  deliveryAnnotations: [],
  messageAnnotations: [],
  applicationProperties: [],
};

describe('filterIndexSignature', () => {
  it('changes when the filter changes', () => {
    const a = filterIndexSignature({
      filter: emptyFilter,
      messagesVersion: 0,
    });
    const b = filterIndexSignature({
      filter: {
        ...emptyFilter,
        body: [{ isActive: true, filterType: 'contains', value: 'x' }],
      } as MessageFilter,
      messagesVersion: 0,
    });

    expect(a).not.toEqual(b);
  });

  it('changes when messages are added, so a stale index is rebuilt', () => {
    expect(
      filterIndexSignature({ filter: emptyFilter, messagesVersion: 0 }),
    ).not.toEqual(
      filterIndexSignature({ filter: emptyFilter, messagesVersion: 1 }),
    );
  });

  it('changes when the selection changes', () => {
    expect(
      filterIndexSignature({ selectionKeys: ['a'], messagesVersion: 0 }),
    ).not.toEqual(
      filterIndexSignature({ selectionKeys: ['b'], messagesVersion: 0 }),
    );
  });

  it('is stable for the same inputs, so no rebuild happens per page read', () => {
    expect(
      filterIndexSignature({ filter: emptyFilter, messagesVersion: 3 }),
    ).toEqual(filterIndexSignature({ filter: emptyFilter, messagesVersion: 3 }));
  });
});

describe('buildFilterIndexStatements', () => {
  it('recreates the table and fills it in ascending id order', () => {
    const statements = buildFilterIndexStatements({
      clause: 'WHERE messages.body LIKE ?',
      args: ['%x%'],
    });

    expect(statements.map((s) => s.sql)).toEqual([
      `DROP TABLE IF EXISTS temp.${FILTER_INDEX_TABLE}`,
      `CREATE TEMP TABLE ${FILTER_INDEX_TABLE} (rowIndex INTEGER PRIMARY KEY, id TEXT NOT NULL)`,
      `INSERT INTO ${FILTER_INDEX_TABLE} (id) SELECT id FROM messages WHERE messages.body LIKE ? ORDER BY id ASC`,
    ]);
    expect(statements[2].args).toEqual(['%x%']);
  });
});

describe('buildFilterIndexPageQuery', () => {
  it('seeks on rowIndex instead of paying for an OFFSET over the filtered scan', () => {
    const { sql, args } = buildFilterIndexPageQuery({
      skip: 400000,
      take: 100,
      ascending: true,
      total: 700000,
    });

    expect(sql).not.toContain('OFFSET');
    expect(sql).toContain('WHERE f.rowIndex > ?');
    expect(sql).toContain('ORDER BY f.rowIndex ASC');
    expect(args).toEqual([400000, 100]);
  });

  it('omits the seek for the first page', () => {
    const { sql, args } = buildFilterIndexPageQuery({
      take: 100,
      ascending: true,
      total: 700000,
    });

    expect(sql).not.toContain('WHERE');
    expect(args).toEqual([100]);
  });

  it('reads a descending page from the end of the index', () => {
    const { sql, args } = buildFilterIndexPageQuery({
      skip: 10,
      take: 5,
      ascending: false,
      total: 100,
    });

    expect(sql).toContain('WHERE f.rowIndex <= ?');
    expect(sql).toContain('ORDER BY f.rowIndex DESC');
    // rowIndex counts 1..100, so rows 10..14 of the descending view are
    // rowIndex 90 down to 86.
    expect(args).toEqual([90, 5]);
  });

  it('takes everything from the seek position when take is omitted', () => {
    const { sql, args } = buildFilterIndexPageQuery({
      skip: 5,
      ascending: true,
      total: 100,
    });

    expect(sql).not.toContain('LIMIT');
    expect(args).toEqual([5]);
  });
});
