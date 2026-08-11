import { MessageFilter } from '@service-bus-browser/filtering';
import { WhereClause } from './filter-to-where-clause';

/**
 * Temp table holding the ordered ids of the rows matching the active filter —
 * `rowIndex` is the row's position in the filtered result set, so the grid can
 * seek to any position in constant time. See `docs/filtered-paging.md`.
 */
export const FILTER_INDEX_TABLE = 'filterIndex';

/**
 * Identity of a materialized filter index. Any change to the filter, the
 * selection or the message set itself must rebuild it, so all three go into the
 * signature. Sort direction deliberately does not: the index is always built
 * ascending and read backwards for descending pages, so flipping the sort (or
 * mixing a descending read with an ascending count) never triggers a rebuild.
 */
export function filterIndexSignature(options: {
  filter?: MessageFilter;
  selectionKeys?: string[];
  messagesVersion: number;
}): string {
  return JSON.stringify([
    options.filter ?? null,
    options.selectionKeys ?? null,
    options.messagesVersion,
  ]);
}

/**
 * Statements that (re)build the filter index. Runs entirely inside SQLite: one
 * scan of `messages` evaluating the predicate, and the resulting ids land in
 * insertion order, so `rowIndex` (an `INTEGER PRIMARY KEY`, i.e. the rowid)
 * counts 1..N in ascending id order.
 */
export function buildFilterIndexStatements(
  whereClause: WhereClause,
): Array<{ sql: string; args: WhereClause['args'] }> {
  return [
    { sql: `DROP TABLE IF EXISTS temp.${FILTER_INDEX_TABLE}`, args: [] },
    {
      sql: `CREATE TEMP TABLE ${FILTER_INDEX_TABLE} (rowIndex INTEGER PRIMARY KEY, id TEXT NOT NULL)`,
      args: [],
    },
    {
      sql: `INSERT INTO ${FILTER_INDEX_TABLE} (id) SELECT id FROM messages ${whereClause.clause} ORDER BY id ASC`,
      args: whereClause.args ?? [],
    },
  ];
}

/** Number of rows matching the filter the index was built for. */
export function buildFilterIndexCountQuery(): string {
  return `SELECT COUNT(*) as count FROM ${FILTER_INDEX_TABLE}`;
}

/**
 * Reads one window of the filtered result set. Seeks on `rowIndex` instead of
 * `LIMIT/OFFSET` over the filtered scan, which is what makes a jump to row
 * 400.000 cost the same as a jump to row 10.
 */
export function buildFilterIndexPageQuery(options: {
  skip?: number;
  take?: number;
  ascending: boolean;
  /** Row count of the index, needed to read a descending page from the end. */
  total: number;
}): { sql: string; args: Array<number> } {
  const { skip = 0, take, ascending, total } = options;
  const args: number[] = [];
  let sql = `SELECT m.message FROM ${FILTER_INDEX_TABLE} f JOIN messages m ON m.id = f.id`;

  if (ascending) {
    if (skip) {
      sql += ` WHERE f.rowIndex > ?`;
      args.push(skip);
    }
    sql += ` ORDER BY f.rowIndex ASC`;
  } else {
    // rowIndex counts 1..total ascending, so the descending page starting at
    // `skip` ends at rowIndex `total - skip` and walks down from there.
    sql += ` WHERE f.rowIndex <= ?`;
    args.push(total - skip);
    sql += ` ORDER BY f.rowIndex DESC`;
  }

  if (take) {
    sql += ` LIMIT ?`;
    args.push(take);
  }

  return { sql, args };
}
