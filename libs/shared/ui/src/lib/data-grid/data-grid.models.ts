/**
 * Public models for {@link SbbDataGrid}.
 *
 * These are the ONLY grid types feature libraries should reference. The
 * underlying CDK primitives (`cdk-virtual-scroll-viewport`, `SelectionModel`)
 * are an implementation detail and must never leak through this surface.
 */

/** Sort direction for a column. `null` means "unsorted". */
export type SbbSortDirection = 'asc' | 'desc' | null;

/** Selection behaviour of the grid. */
export type SbbSelectionMode = 'none' | 'single' | 'multiple';

/**
 * Declarative column definition.
 *
 * @typeParam T - row shape.
 */
export interface SbbColumn<T = unknown> {
  /**
   * Dotted field path resolved against a row (e.g. `properties.subject`).
   * Also used as the stable column identity for sort state.
   */
  field: string;
  /** Text rendered in the column header. */
  header: string;
  /**
   * Whether this column can be sorted client-side. Defaults to `true`.
   * Set `false` for columns backed by lazily-loaded rows.
   */
  sortable?: boolean;
  /** Optional fixed width (CSS length, e.g. `'20%'` or `'120px'`). */
  width?: string;
  /**
   * Optional value accessor. Overrides dotted-path resolution when present.
   * Return the raw value to render (and to sort by).
   */
  value?: (row: T) => unknown;
}

/** Current sort state emitted by {@link SbbDataGrid.sortChange}. */
export interface SbbSortState {
  field: string;
  direction: SbbSortDirection;
}

/**
 * Payload emitted by {@link SbbDataGrid.lazyLoad} when the viewport nears the
 * end of the currently-loaded window and more rows are expected.
 *
 * `first`/`last` are absolute row indices into the full (possibly server-side)
 * dataset. `last` is exclusive. `totalRecords` echoes the grid's current
 * awareness of the total, so the host can decide whether a fetch is warranted.
 */
export interface SbbLazyLoadEvent {
  /** Absolute index of the first row to load (inclusive). */
  first: number;
  /** Absolute index one past the last row to load (exclusive). */
  last: number;
  /** Number of rows requested (`last - first`). */
  rows: number;
  /** Grid's current view of the total record count. */
  totalRecords: number;
}

/** Resolve a dotted field path against a row, honouring a column accessor. */
export function resolveField<T>(row: T, column: SbbColumn<T>): unknown {
  if (column.value) {
    return column.value(row);
  }
  if (row === null || row === undefined) {
    return undefined;
  }
  let current: unknown = row;
  for (const part of column.field.split('.')) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
