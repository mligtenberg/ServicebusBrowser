import { Directive } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

/**
 * Restricts drag-to-reorder within a `SbbReorderableList` row to just the
 * element this is applied to (e.g. a drag-handle icon), rather than the whole
 * row. Wraps `CdkDragHandle` so consumers never import `@angular/cdk` directly
 * (ADR-0006).
 */
@Directive({
  selector: '[sbbReorderableListHandle]',
  standalone: true,
  hostDirectives: [CdkDragHandle],
  host: { class: 'sbb-reorderable-list__handle' },
})
export class SbbReorderableListHandle {}
