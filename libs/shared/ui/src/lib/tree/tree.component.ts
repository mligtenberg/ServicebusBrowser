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

/**
 * `SbbTree` — a styled, headless tree built on `@angular/cdk/tree`.
 *
 * Opinionated-minimal public API (NOT a CDK pass-through):
 *  - `nodes`            hierarchical data (`SbbTreeNode[]`); children via `.children`.
 *  - `<ng-template sbbTreeNode>` projects the per-node content.
 *  - `selectedId` / `selectedIdChange` two-way single selection by node id.
 *  - `nodeSelect`       emits the selected node object.
 *  - `expandedIds` / `expandedIdsChange` two-way expansion state (list of ids).
 *  - `nodeExpand` / `nodeCollapse` emit the toggled node.
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

  /** Two-way: id of the single selected node (`undefined` = no selection). */
  readonly selectedId = model<string | undefined>(undefined);

  /** Two-way: ids of the currently expanded nodes. */
  readonly expandedIds = model<string[]>([]);

  /** Emits the node object that just became selected. */
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

  protected readonly trackBy = (_index: number, node: T): string => node.id;

  /** Fast membership lookup for the template. */
  private readonly expandedSet = computed(() => new Set(this.expandedIds()));

  protected isExpanded(node: T): boolean {
    return this.expandedSet().has(node.id);
  }

  protected isSelected(node: T): boolean {
    return this.selectedId() === node.id;
  }

  protected isLeaf(node: T): boolean {
    return this.childrenAccessor(node).length === 0;
  }

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
        this.onSelect(node);
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

  /** Selection handler wired to the node row. */
  protected onSelect(node: T): void {
    if (this.selectedId() === node.id) {
      return;
    }
    this.selectedId.set(node.id);
    this.nodeSelect.emit(node);
  }
}
