import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  contentChild,
  computed,
  input,
  model,
  output,
  effect,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CdkTree,
  CdkTreeModule,
} from '@angular/cdk/tree';
import { SbbTreeNode } from './tree.models';
import { SbbTreeNodeDef } from './tree-node-def.directive';

/** Selection behaviour of an {@link SbbTree}. */
export type SbbTreeSelectionMode = 'single' | 'multiple';

/**
 * `SbbTree` — a styled, headless tree built on `@angular/cdk/tree`.
 *
 * Opinionated-minimal public API (NOT a CDK pass-through):
 *  - `nodes`            hierarchical data (`SbbTreeNode[]`); children via `.children`.
 *  - `<ng-template sbbTreeNode>` projects the per-node content.
 *  - `selectionMode`    `'single'` (default) or `'multiple'`.
 *  - `selectedIds` / `selectedIdsChange` two-way selection by node id (the
 *    canonical selection model in every mode; holds 0..1 ids in single mode).
 *  - `selectionChange`  emits the selected node objects on any selection change.
 *  - `nodeSelect`       emits the node the user just activated (click / Enter).
 *  - `rangeFilter`      optional predicate restricting which nodes a shift-range
 *    selection includes, evaluated against the just-clicked node (see below).
 *  - `expandedIds` / `expandedIdsChange` two-way expansion state (list of ids).
 *  - `nodeExpand` / `nodeCollapse` emit the toggled node.
 *
 * Selection semantics in `'multiple'` mode mirror the topology tree:
 *  - plain click            → replace selection with the clicked node.
 *  - Ctrl/Cmd + click       → toggle the clicked node in/out of the selection.
 *  - Shift + click          → extend the selection with every *selectable* node
 *    between the anchor and the clicked node in visible (flattened, expansion-
 *    aware) order. `rangeFilter(candidate, clicked)` can further restrict the
 *    range (topology passes `(c, t) => c.type === t.type` for same-type ranges).
 * Non-selectable nodes (`selectable === false`) never enter the selection.
 *
 * CDK types never leak through the public surface. Indentation + toggle-button
 * sizing reproduce the current PrimeNG topology tree via `--sbb-*` tokens.
 */
@Component({
  selector: 'sbb-tree',
  imports: [CdkTreeModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
})
export class SbbTree<T extends SbbTreeNode = SbbTreeNode> {
  /** Root nodes of the hierarchical data. */
  readonly nodes = input<T[]>([]);

  /** Single- vs. multi-select behaviour. */
  readonly selectionMode = input<SbbTreeSelectionMode>('single');

  /**
   * Two-way: ids of the currently selected nodes. Canonical in every mode —
   * `'single'` mode keeps it at 0 or 1 id.
   */
  readonly selectedIds = model<readonly string[]>([]);

  /** Two-way: ids of the currently expanded nodes. */
  readonly expandedIds = model<string[]>([]);

  /**
   * Optional predicate limiting which candidate nodes a shift-range selection
   * includes. Called with each candidate node in the range and the node the
   * user just clicked. When omitted, every selectable node in the range is kept.
   */
  readonly rangeFilter = input<(candidate: T, clicked: T) => boolean>();

  /** Emits the selected node objects whenever the selection changes. */
  readonly selectionChange = output<T[]>();

  /** Emits the node object the user just activated (click / Enter). */
  readonly nodeSelect = output<T>();

  /** Emits the node object that was just expanded. */
  readonly nodeExpand = output<T>();

  /** Emits the node object that was just collapsed. */
  readonly nodeCollapse = output<T>();

  /** The projected per-node template. */
  protected readonly nodeDef = contentChild.required(SbbTreeNodeDef);

  /** Handle to the underlying CDK tree so we can sync expansion state. */
  @ViewChild(CdkTree) private cdkTree?: CdkTree<T>;

  /** CDK needs a plain accessor; typed here so callers never see it. */
  protected readonly childrenAccessor = (node: T): T[] =>
    (node.children as T[] | undefined) ?? [];

  // NOTE: no `trackBy` is provided. Consumers (e.g. the topology tree) rebuild
  // the whole `nodes` array on every filter change while keeping stable ids;
  // with `trackBy` by id, CdkTree reuses a same-id parent's view and keeps its
  // *stale* children. Omitting it makes CdkTree re-render on array replacement
  // (PrimeNG's model), so changed child sets refresh. Expansion/selection are
  // preserved because they live in the external `expandedIds`/`selectedIds`.

  /** Fast membership lookup for the template. */
  private readonly expandedSet = computed(() => new Set(this.expandedIds()));

  /** Fast selection-membership lookup for the template. */
  private readonly selectedSet = computed(() => new Set(this.selectedIds()));

  /**
   * The anchor node for shift-range selection: the last node selected by a
   * plain or Ctrl/Cmd click. `undefined` until the first such selection.
   */
  private anchorId: string | undefined;

  /** Nodes in visible (flattened, expansion-aware) order — the range domain. */
  private readonly visibleFlatNodes = computed<T[]>(() => {
    const expanded = this.expandedSet();
    const out: T[] = [];
    const walk = (list: T[]) => {
      for (const node of list) {
        out.push(node);
        if (expanded.has(node.id)) {
          walk(this.childrenAccessor(node));
        }
      }
    };
    walk(this.nodes());
    return out;
  });

  protected isExpanded(node: T): boolean {
    return this.expandedSet().has(node.id);
  }

  protected isSelected(node: T): boolean {
    return this.selectedSet().has(node.id);
  }

  protected isSelectable(node: T): boolean {
    return node.selectable !== false;
  }

  protected isLeaf(node: T): boolean {
    return this.childrenAccessor(node).length === 0;
  }

  /** True when the tree allows more than one selected node. */
  protected readonly multiselectable = computed(
    () => this.selectionMode() === 'multiple',
  );

  constructor() {
    // Keep the CDK tree's internal expansion model in sync with our public
    // `expandedIds`, so programmatic changes to the input reflect in the DOM.
    effect(() => {
      const expanded = this.expandedSet();
      const tree = this.cdkTree;
      if (!tree) {
        return;
      }
      const walk = (list: T[]) => {
        for (const n of list) {
          const shouldExpand = expanded.has(n.id);
          const currentlyExpanded = tree.isExpanded(n);
          if (shouldExpand && !currentlyExpanded) {
            tree.expand(n);
          } else if (!shouldExpand && currentlyExpanded) {
            tree.collapse(n);
          }
          walk(this.childrenAccessor(n));
        }
      };
      walk(this.nodes());
    });
  }

  /** Toggle handler wired to the node's toggle button. */
  protected onToggle(node: T): void {
    const wasExpanded = this.isExpanded(node);
    this.expandedIds.update((ids) =>
      wasExpanded ? ids.filter((id) => id !== node.id) : [...ids, node.id],
    );
    if (wasExpanded) {
      this.nodeCollapse.emit(node);
    } else {
      this.nodeExpand.emit(node);
    }
  }

  /** Keyboard handler for the node row: Enter/Space selects, arrows toggle. */
  protected onRowKeydown(node: T, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select(node, {
          additive: event.ctrlKey || event.metaKey,
          range: event.shiftKey,
        });
        break;
      case 'ArrowRight':
        if (!this.isLeaf(node) && !this.isExpanded(node)) {
          event.preventDefault();
          this.onToggle(node);
        }
        break;
      case 'ArrowLeft':
        if (!this.isLeaf(node) && this.isExpanded(node)) {
          event.preventDefault();
          this.onToggle(node);
        }
        break;
      default:
        break;
    }
  }

  /** Pointer selection handler wired to the node row. */
  protected onRowClick(node: T, event: MouseEvent): void {
    this.select(node, {
      additive: event.ctrlKey || event.metaKey,
      range: event.shiftKey,
    });
  }

  /**
   * Applies a selection interaction against `node`. `additive` toggles a single
   * node (Ctrl/Cmd); `range` extends from the anchor (Shift). Non-selectable
   * nodes are ignored.
   */
  private select(node: T, opts: { additive: boolean; range: boolean }): void {
    if (!this.isSelectable(node)) {
      return;
    }

    if (this.selectionMode() === 'single') {
      const current = this.selectedIds();
      if (current.length === 1 && current[0] === node.id) {
        // Already the sole selection — no-op (do not re-emit).
        return;
      }
      this.anchorId = node.id;
      this.setSelection([node.id]);
      this.nodeSelect.emit(node);
      return;
    }

    // Multiple mode.
    if (opts.range && this.anchorId !== undefined) {
      const rangeIds = this.computeRange(this.anchorId, node);
      const merged = new Set(this.selectedIds());
      for (const id of rangeIds) {
        merged.add(id);
      }
      // Anchor deliberately unchanged so successive shift-clicks re-pivot.
      this.setSelection([...merged]);
    } else if (opts.additive) {
      const next = new Set(this.selectedIds());
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      this.anchorId = node.id;
      this.setSelection([...next]);
    } else {
      this.anchorId = node.id;
      this.setSelection([node.id]);
    }
    this.nodeSelect.emit(node);
  }

  /**
   * Ids of the selectable nodes between the anchor and the clicked node in
   * visible order, further restricted by {@link rangeFilter} (evaluated against
   * the clicked node).
   */
  private computeRange(anchorId: string, clicked: T): string[] {
    const flat = this.visibleFlatNodes();
    const fromIndex = flat.findIndex((n) => n.id === anchorId);
    const toIndex = flat.findIndex((n) => n.id === clicked.id);
    if (fromIndex === -1 || toIndex === -1) {
      return this.isSelectable(clicked) ? [clicked.id] : [];
    }
    const lo = Math.min(fromIndex, toIndex);
    const hi = Math.max(fromIndex, toIndex);
    const filter = this.rangeFilter();
    return flat
      .slice(lo, hi + 1)
      .filter((n) => this.isSelectable(n) && (!filter || filter(n, clicked)))
      .map((n) => n.id);
  }

  /** Writes the selection model and emits the resolved node objects. */
  private setSelection(ids: string[]): void {
    this.selectedIds.set(ids);

    const byId = new Map<string, T>();
    const collect = (list: T[]) => {
      for (const n of list) {
        byId.set(n.id, n);
        collect(this.childrenAccessor(n));
      }
    };
    collect(this.nodes());

    this.selectionChange.emit(
      ids
        .map((id) => byId.get(id))
        .filter((n): n is T => n !== undefined),
    );
  }
}
