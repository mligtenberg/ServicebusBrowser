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
import { SbbContextMenu } from '../context-menu';
import { SbbMenuItem } from '../menu';

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
  imports: [ScrollingModule, SbbContextMenu],
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

  /**
   * When `true`, the grid does NOT mutate `selection` on row click — it only
   * emits {@link rowClick}/{@link rowMouseDown} and reflects the `selection`
   * model for highlighting. Lets a host own complex selection semantics (e.g.
   * contiguous shift-range across lazily-loaded rows) while still using the
   * grid's rendering/virtualization. Ignored for context-menu selection.
   */
  manualSelection = input<boolean>(false);

  /** Shows a loading overlay over the viewport. */
  loading = input<boolean>(false);

  /** Hides the header row completely, useful for simple property lists. */
  hideHeader = input<boolean>(false);

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

  /**
   * Optional right-click context menu shown per row. When non-empty, each row
   * becomes a context-menu trigger; the menu is built from these items and the
   * chosen item's `onSelect` receives the row. Right-clicking a row also
   * selects it (unless `selectionMode` is `'none'`).
   */
  rowContextMenu = input<SbbMenuItem<T>[]>([]);

  /**
   * Adapter exposing the public `(row, index)` {@link trackBy} to CDK's
   * `TrackByFunction<T>` shape `(index, row)`, used by `*cdkVirtualFor`.
   */
  protected readonly cdkTrackBy = (index: number, row: T): unknown =>
    this.trackBy()(row, index);

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

  /** Fires with the row whose context menu was opened (right-clicked). */
  rowContextMenuOpened = output<T>();

  /** Fires on every row click (row is `null` for unloaded lazy placeholders). */
  rowClick = output<{ event: MouseEvent; row: T | null; index: number }>();

  /** Fires on row mousedown (before click), for hosts implementing range select. */
  rowMouseDown = output<{ event: MouseEvent; row: T | null; index: number }>();

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
  private lastEmittedLazyFirst = -1;
  private lastEmittedLazyLast = -1;

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

    // Drive lazy loading off the viewport's rendered-range stream rather than
    // only `scrolledIndexChange`. The stream also fires on the FIRST render, so
    // a sparse dataset (all placeholders) requests its initial window without
    // needing a user scroll — otherwise the grid would render empty rows.
    effect((onCleanup) => {
      const vp = this.viewport();
      if (!vp) {
        return;
      }
      // Track changes to input data and totalRecords to re-evaluate lazy loading
      this.data();
      this.effectiveTotal();

      this.checkLazyLoad();

      const sub = vp.renderedRangeStream.subscribe(() => this.checkLazyLoad());
      onCleanup(() => sub.unsubscribe());
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

  /** Emit a row mousedown (hosts use this for shift-range anchoring). */
  protected onRowMouseDown(event: MouseEvent, row: T | null, index: number): void {
    this.rowMouseDown.emit({ event, row, index });
  }

  /** Handle a row click, honouring modifier keys for multi-selection. */
  protected onRowClick(event: MouseEvent, row: T | null, index: number): void {
    this.rowClick.emit({ event, row, index });

    const mode = this.selectionMode();
    if (mode === 'none' || this.manualSelection() || row == null) {
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
  protected onRowKeydown(event: Event, row: T, index: number): void {
    event.preventDefault();
    // Reuse click semantics; ctrl/meta/shift on the KeyboardEvent toggle-select.
    this.onRowClick(event as unknown as MouseEvent, row, index);
  }

  /**
   * Right-click on a row: select it (joining/replacing per selection mode) so
   * menu commands act on it, then notify the host.
   */
  protected onRowContextMenu(row: T, index: number): void {
    const mode = this.selectionMode();
    if (mode !== 'none' && !this.manualSelection() && row != null) {
      const id = this.trackBy()(row, index);
      if (!this.selectionModel.isSelected(id)) {
        if (mode === 'multiple') {
          this.selectionModel.select(id);
        } else {
          this.selectionModel.setSelection(id);
        }
        this.emitSelection();
      }
    }
    this.rowContextMenuOpened.emit(row);
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

  /**
   * Gate {@link lazyLoad} emission from the current rendered range. Supports the
   * two loading shapes the {@link data} contract allows:
   *
   *  1. **Sparse full-length window** — `data` spans the whole dataset with
   *     `null`/`undefined` placeholders for unloaded rows (its length equals
   *     `totalRecords`). We look for unloaded rows inside the rendered window
   *     (plus a threshold of look-ahead) and request exactly that gap.
   *  2. **Dense loaded prefix** — `data` holds only the rows loaded so far
   *     (its length is the loaded count, `< totalRecords`). We request the next
   *     chunk once the viewport nears the end of the loaded prefix.
   */
  protected checkLazyLoad(): void {
    if (!this.lazy()) {
      return;
    }
    const vp = this.viewport();
    if (!vp) {
      return;
    }
    const range = vp.getRenderedRange();
    const data = this.data();
    const total = this.effectiveTotal();
    const threshold = this.lazyLoadThreshold();

    // Shape 1: fill placeholder gaps inside (and just past) the rendered window.
    const scanEnd = Math.min(total, range.end + threshold);
    let firstMissing = -1;
    let lastMissing = -1;
    for (let i = range.start; i < scanEnd; i++) {
      if (data[i] === null || data[i] === undefined) {
        if (firstMissing === -1) {
          firstMissing = i;
        }
        lastMissing = i;
      }
    }
    if (firstMissing !== -1) {
      const first = firstMissing;
      const last = Math.min(total, lastMissing + 1);
      if (
        last > first &&
        !(this.lastEmittedLazyFirst === first && this.lastEmittedLazyLast === last)
      ) {
        this.lastEmittedLazyFirst = first;
        this.lastEmittedLazyLast = last;
        this.lazyLoad.emit({ first, last, rows: last - first, totalRecords: total });
      }
      return;
    }

    // Shape 2: append the next chunk near the end of a dense loaded prefix.
    const loaded = data.length;
    if (loaded >= total) {
      return;
    }
    if (range.end < loaded - threshold) {
      return;
    }
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
    this.lastEmittedLazyFirst = -1;
    this.lastEmittedLazyLast = -1;
  }

  /** Scroll a given row index into view. */
  scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    this.viewport()?.scrollToIndex(index, behavior);
  }
}
