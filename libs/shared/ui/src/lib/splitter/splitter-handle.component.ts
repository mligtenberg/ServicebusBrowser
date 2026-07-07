import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrnResizableHandle } from '@spartan-ng/brain/resizable';

/**
 * Internal draggable gutter rendered between two `SbbSplitterPanel`s.
 *
 * Not exported from the public barrel: `SbbSplitter` inserts one of these as
 * a real DOM sibling after every panel except the last, which is required
 * for `BrnResizableHandle`'s sibling-based index lookup to resolve correctly.
 * The visual grip is drawn with CSS (see splitter-handle.component.scss)
 * instead of relying on brain's `withHandle` inner-element rendering.
 */
@Component({
  selector: 'sbb-splitter-handle',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styleUrl: './splitter-handle.component.scss',
  hostDirectives: [BrnResizableHandle],
  host: {
    class: 'sbb-splitter-handle',
  },
})
export class SbbSplitterHandle {}
