import { Directive, inject, TemplateRef } from '@angular/core';

/** Template context handed to a projected `<ng-template sbbReorderableListItem>`. */
export interface SbbReorderableListItemContext<T> {
  $implicit: T;
  index: number;
}

/**
 * Marks the per-item row template for `SbbReorderableList`, so the reorderable
 * content (a column picker row, a filter chip, anything) stays entirely up to
 * the consuming template — this component only owns the drag/drop mechanics
 * and iteration.
 *
 * ```html
 * <sbb-reorderable-list [items]="fields()" (reordered)="onReordered($event)">
 *   <ng-template sbbReorderableListItem let-field let-i="index">
 *     <span sbbReorderableListHandle>::</span>
 *     {{ field }}
 *   </ng-template>
 * </sbb-reorderable-list>
 * ```
 */
@Directive({ selector: '[sbbReorderableListItem]', standalone: true })
export class SbbReorderableListItemDef<T> {
  readonly template = inject<TemplateRef<SbbReorderableListItemContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: SbbReorderableListItemDef<T>,
    _ctx: unknown,
  ): _ctx is SbbReorderableListItemContext<T> {
    return true;
  }
}
