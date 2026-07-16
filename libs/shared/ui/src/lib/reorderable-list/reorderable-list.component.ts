import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { SbbReorderableListItemDef } from './reorderable-list-item.directive';

/** Emitted by `SbbReorderableList` after a drag-to-reorder gesture actually moves an item. */
export interface SbbReorderableListReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

/**
 * `SbbReorderableList` — a generic drag-to-reorder list. It owns the drag/drop
 * mechanics (Angular CDK drag-drop, kept behind this component per ADR-0006 —
 * consumers never import `@angular/cdk` directly) and iteration over `items`;
 * what each row actually renders is entirely up to the projected
 * `<ng-template sbbReorderableListItem>`, so this one component covers any
 * reorderable list (a message viewer's column picker, a filter chip list,
 * anything) rather than each call site rebuilding its own `CdkDropList`.
 *
 * It doesn't own the backing array — `items` is read-only here, and a drop
 * only emits `(reordered)` with the moved indices. The consumer applies the
 * move to its own array (typically via `moveItemInArray`, still fine to use
 * for that since it's a pure array helper, not a CDK component/directive).
 *
 * Wrap a specific element in `[sbbReorderableListHandle]` to restrict
 * dragging to that element (e.g. a drag-handle icon) instead of the whole row.
 */
@Component({
  selector: 'sbb-reorderable-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CdkDropList, CdkDrag],
  template: `
    <div
      class="sbb-reorderable-list"
      role="list"
      [class.sbb-reorderable-list--disabled]="disabled()"
      cdkDropList
      [cdkDropListOrientation]="orientation()"
      [cdkDropListDisabled]="disabled()"
      (cdkDropListDropped)="onDropped($event)"
    >
      @for (item of items(); track $index; let i = $index) {
        <div
          class="sbb-reorderable-list__item"
          role="listitem"
          cdkDrag
          [cdkDragLockAxis]="dragLockAxis()"
          [cdkDragDisabled]="disabled()"
        >
          @if (itemTemplate(); as template) {
            <ng-container [ngTemplateOutlet]="template.template" [ngTemplateOutletContext]="{ $implicit: item, index: i }" />
          }
        </div>
      }
    </div>
  `,
  styleUrl: './reorderable-list.component.scss',
  host: { class: 'sbb-reorderable-list-host' },
})
export class SbbReorderableList<T> {
  /** Items to render, in order. Read-only — reordering is applied by the consumer via `(reordered)`. */
  readonly items = input.required<readonly T[]>();

  /** Drag axis/list direction. @default 'vertical' */
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');

  /** Disables drag-to-reorder entirely. @default false */
  readonly disabled = input(false);

  /** Emitted after a drag-to-reorder gesture moves an item to a new index. */
  readonly reordered = output<SbbReorderableListReorderEvent>();

  protected readonly itemTemplate = contentChild(SbbReorderableListItemDef);

  protected readonly dragLockAxis = computed(() => (this.orientation() === 'horizontal' ? 'x' : 'y'));

  protected onDropped(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.reordered.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex });
  }
}
