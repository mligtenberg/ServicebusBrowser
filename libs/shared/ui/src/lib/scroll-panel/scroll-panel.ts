import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `SbbScrollPanel` — a scrollable container with styled (thin, themed)
 * scrollbars, projecting arbitrary content.
 *
 * Opinionated-minimal replacement for `p-scroll-panel`. There is no matching
 * `@spartan-ng/brain` primitive (brain@1.0.4 ships no scroll-area), so this
 * wraps a plain native element with `overflow: auto` and CSS
 * `scrollbar-color`/`::-webkit-scrollbar` styling rather than any brain/CDK
 * primitive.
 *
 * Public API derived from current `p-scroll-panel` call sites:
 *  - Most call sites size the panel via the surrounding flex/grid layout
 *    (the panel simply fills its parent, like `p-scroll-panel`'s default
 *    100%/100% behavior) — `:host` is a block that fills available space.
 *  - `messages-viewer` toggles scrollbar visibility off while a splitter
 *    drag is in progress (`[ngClass]="{'hide-scrollbar': isResizing()}"`) —
 *    exposed here as the `hideScrollbar` input.
 *
 * Usage:
 * ```html
 * <sbb-scroll-panel>
 *   <div class="content">...</div>
 * </sbb-scroll-panel>
 * <sbb-scroll-panel [hideScrollbar]="isResizing()">...</sbb-scroll-panel>
 * ```
 */
@Component({
  selector: 'sbb-scroll-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-panel.html',
  styleUrl: './scroll-panel.scss',
  host: {
    class: 'sbb-scroll-panel-host',
    '[class.sbb-scroll-panel-host--hide-scrollbar]': 'hideScrollbar()',
  },
})
export class SbbScrollPanel {
  /**
   * When `true`, hides the scrollbar visually (content remains scrollable).
   * Mirrors the "hide scrollbar while resizing" pattern used by the messages
   * viewer's splitter drag.
   */
  readonly hideScrollbar = input<boolean>(false);
}
