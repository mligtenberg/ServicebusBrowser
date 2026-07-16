import { Directive, TemplateRef, inject } from '@angular/core';
import { SbbTreeNode } from './tree.models';

/**
 * Marks the `<ng-template>` that renders each node's content inside an
 * {@link SbbTree}. The template receives an implicit context of the consumer's
 * node object, so it is used like:
 *
 * ```html
 * <sbb-tree [nodes]="roots">
 *   <ng-template sbbTreeNode let-node>
 *     {{ node.label }}
 *   </ng-template>
 * </sbb-tree>
 * ```
 *
 * This is the ONLY projection seam — the consumer never touches CDK templates.
 */
@Directive({
  selector: '[sbbTreeNode]',
})
export class SbbTreeNodeDef<T extends SbbTreeNode = SbbTreeNode> {
  readonly template = inject<TemplateRef<SbbTreeNodeContext<T>>>(TemplateRef);

  /** Type-narrowing helper so `let-node` is typed in strict templates. */
  static ngTemplateContextGuard<T extends SbbTreeNode>(
    _dir: SbbTreeNodeDef<T>,
    ctx: unknown,
  ): ctx is SbbTreeNodeContext<T> {
    return true;
  }
}

/** Implicit context handed to the projected node template. */
export interface SbbTreeNodeContext<T extends SbbTreeNode> {
  $implicit: T;
  /** True when this node currently holds the single selection. */
  selected: boolean;
  /** True when this node is expanded (only meaningful for non-leaf nodes). */
  expanded: boolean;
  /** True when the node has no children. */
  leaf: boolean;
}
