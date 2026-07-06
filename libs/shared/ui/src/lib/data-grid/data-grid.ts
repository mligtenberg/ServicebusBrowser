import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import {
  SbbColumn,
  SbbLazyLoadEvent,
  SbbSelectionMode,
  SbbSortDirection,
  SbbSortState,
  resolveField,
} from './data-grid.models';

/**
 * Headless, virtualized, selectable data-grid built on Angular CDK.
 *
 * Replaces the PrimeNG `p-table` used by the messages viewer. Renders only a
 * window of rows (`cdk-virtual-scroll-viewport`), tracks selection via
 * `SelectionModel`, supports client-side single-column sort, and emits a
 * `lazyLoad` event when the viewport nears the end of the loaded window.
 *
 * This is an OPINIONATED-MINIMAL API — the CDK primitives underneath are a
 * hidden implementation detail and never leak through inputs/outputs.
 *
 * @typeParam T - row shape. Rows are identified by {@link SbbDataGrid.trackBy}.
 */
@Component({
  selector: 'sbb-data-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.scss',
})
export class SbbDataGrid<T = unknown> {
  // ---------------------------------------------------------------------------
  // Inputs
  // ---------------------------------------------------------------------------

  /** Column definitions in display order. */
  columns = input.required<SbbColumn<T>[]>();

  /**
   * The currently-loaded rows. In lazy mode this is a sparse window into a
   * larger dataset; missing indices should be `null`/`undefined` placeholders.
   */
  data = input.required<ReadonlyArray<T>>();

  /** `'none' | 'single' | 'multiple'`. Defaults to `'single'`. */
  selectionMode = input<SbbSelectionMode>('single');

  /** Enable lazy loading (emits {@link lazyLoad} near the scroll end). */
  lazy = input<boolean>(false);

  /**
   * Total records in the full dataset. Only meaningful when {@link lazy} is
   * `true`; drives the scroll extent and gates {@link lazyLoad} emission.
   * Defaults to `data().length`.
   */
  totalRecords = input<number | undefined>(undefined);

  /** Row height in px used by the fixed-size virtual scroll strategy. */
  rowHeight = input<number>(42);

  /**
   * Number of rows before the end of the loaded window at which
   * {@link lazyLoad} fires. Defaults to 20.
   */
  lazyLoadThreshold = input<number>(20);

  /** Stable identity for a row. Defaults to referential identity. */
  trackBy = input<(row: T, index: number) => unknown>((row) => row);

  // ---------------------------------------------------------------------------
  // Two-way / outputs
  // ---------------------------------------------------------------------------

  /**
   * Selected row identities (as produced by {@link trackBy}). Two-way bindable.
   * In `single` mode this holds at most one entry.
   */
  selection = model<ReadonlyArray<unknown>>([]);

  /** Fires with the new sort state whenever a sortable header is clicked. */
  sortChange = output<SbbSortState>();

  /** Fires when the viewport nears the end of the loaded window in lazy mode. */
  lazyLoad = output<SbbLazyLoadEvent>();

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  protected viewport = viewChild(CdkVirtualScrollViewport);

  /** SelectionModel keyed by row identity — the source of truth for selection. */
  private readonly selectionModel = new SelectionModel<unknown>(
    /* multiple */ true,
    [],
  );

  private readonly sortState = signal<SbbSortState>({ field: '', direction: null });

  private lastEmittedLazyEnd = -1;

  constructor() {
    // Keep the SelectionModel in sync with the two-way `selection` input,
    // without echoing our own writes back (guarded by `syncingFromModel`).
    effect(() => {
      const incoming = this.selection();
      if (this.syncingFromModel) {
        return;
      }
      const current = this.selectionModel.selected;
      const same =
        current.length === incoming.length &&
        current.every((v) => incoming.includes(v));
      if (same) {
        return;
      }
      this.selectionModel.setSelection(...incoming);
    });
  }

  private syncingFromModel = false;

  private emitSelection(): void {
    this.syncingFromModel = true;
    this.selection.set([...this.selectionModel.selected]);
    // Release on the next microtask so the effect above sees the flag.
    queueMicrotask(() => (this.syncingFromModel = false));
  }

  // ---------------------------------------------------------------------------
  // Derived view state
  // ---------------------------------------------------------------------------

  /** Effective total record count (falls back to loaded length). */
  protected effectiveTotal = computed(
    () => this.totalRecords() ?? this.data().length,
  );

  /** Current sort field/direction (exposed read-only for the template). */
  protected currentSort = computed(() => this.sortState());

  /**
   * Rows to render. Applies client-side sort when a sortable column is active
   * AND the grid is not lazy (lazy datasets are sorted server-side).
   */
  protected displayRows = computed<ReadonlyArray<T>>(() => {
    const rows = this.data();
    const sort = this.sortState();
    if (this.lazy() || !sort.field || sort.direction === null) {
      return rows;
    }
    const column = this.columns().find((c) => c.field === sort.field);
    if (!column) {
      return rows;
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => this.compare(resolveField(a, column), resolveField(b, column)) * dir);
  });

  private compare(a: unknown, b: unknown): number {
    if (a === b) return 0;
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    return String(a).localeCompare(String(b));
  }

  // ---------------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------------

  protected cellValue(row: T, column: SbbColumn<T>): unknown {
    return row == null ? undefined : resolveField(row, column);
  }

  protected isSelected(row: T, index: number): boolean {
    return this.selectionModel.isSelected(this.trackBy()(row, index));
  }

  protected sortIndicator(column: SbbColumn<T>): SbbSortDirection {
    const sort = this.sortState();
    return sort.field === column.field ? sort.direction : null;
  }

  // ---------------------------------------------------------------------------
  // Interaction
  // ---------------------------------------------------------------------------

  /** Handle a row click, honouring modifier keys for multi-selection. */
  protected onRowClick(event: MouseEvent, row: T, index: number): void {
    const mode = this.selectionMode();
    if (mode === 'none' || row == null) {
      return;
    }
    const id = this.trackBy()(row, index);

    if (mode === 'single') {
      this.selectionModel.setSelection(id);
      this.emitSelection();
      return;
    }

    // multiple
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    if (additive) {
      this.selectionModel.toggle(id);
    } else {
      this.selectionModel.setSelection(id);
    }
    this.emitSelection();
  }

  /** Keyboard equivalent of a row click (Enter/Space). */
  protected onRowKeydown(event: KeyboardEvent, row: T, index: number): void {
    event.preventDefault();
    // Reuse click semantics; ctrl/meta/shift on the KeyboardEvent toggle-select.
    this.onRowClick(event as unknown as MouseEvent, row, index);
  }

  /** Cycle a sortable column through asc -> desc -> unsorted. */
  protected onHeaderClick(column: SbbColumn<T>): void {
    if (column.sortable === false) {
      return;
    }
    const current = this.sortState();
    let direction: SbbSortDirection;
    if (current.field !== column.field) {
      direction = 'asc';
    } else if (current.direction === 'asc') {
      direction = 'desc';
    } else if (current.direction === 'desc') {
      direction = null;
    } else {
      direction = 'asc';
    }
    const next: SbbSortState = { field: direction ? column.field : '', direction };
    this.sortState.set(next);
    this.sortChange.emit({ field: column.field, direction });
  }

  /** Fired by cdk viewport on scroll-index change; gates lazyLoad emission. */
  protected onScrolledIndexChange(): void {
    if (!this.lazy()) {
      return;
    }
    const vp = this.viewport();
    if (!vp) {
      return;
    }
    const range = vp.getRenderedRange();
    const loaded = this.data().length;
    const total = this.effectiveTotal();
    const threshold = this.lazyLoadThreshold();

    // Nothing more to load.
    if (loaded >= total) {
      return;
    }

    // Near the end of what we have loaded?
    if (range.end < loaded - threshold) {
      return;
    }

    // Don't re-emit for the same window end.
    if (loaded === this.lastEmittedLazyEnd) {
      return;
    }
    this.lastEmittedLazyEnd = loaded;

    const first = loaded;
    const last = Math.min(total, loaded + Math.max(range.end - range.start, threshold));
    if (last <= first) {
      return;
    }
    this.lazyLoad.emit({ first, last, rows: last - first, totalRecords: total });
  }

  // ---------------------------------------------------------------------------
  // Imperative helpers (for hosts / tests)
  // ---------------------------------------------------------------------------

  /** Clear all selection. */
  clearSelection(): void {
    this.selectionModel.clear();
    this.emitSelection();
  }

  /** Reset lazy-load bookkeeping (e.g. when the underlying page changes). */
  resetLazyState(): void {
    this.lastEmittedLazyEnd = -1;
  }
}
