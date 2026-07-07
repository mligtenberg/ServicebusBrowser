import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  input,
} from '@angular/core';
import {
  BrnPopover,
  BrnPopoverContent,
} from '@spartan-ng/brain/popover';

/**
 * `SbbPopover` — a styled, click-toggled overlay panel anchored to an
 * external trigger element, projecting arbitrary content.
 *
 * Opinionated-minimal replacement for `p-popover`. Public API derived from
 * current call sites (tasks summary, workspace switcher, send-message /
 * batch-resend system-property editors):
 *  - The popover itself renders no trigger — callers wire an arbitrary
 *    element's `(click)`/`(keydown.enter)` to `toggle()` via a template
 *    reference variable (`#pop`, `pop.toggle($event)`), exactly like the
 *    prior `p-popover #op` + `togglePopover(op, $event)` idiom.
 *  - `align` controls horizontal alignment relative to the trigger
 *    (`'start' | 'center' | 'end'`), parity with the default centered
 *    `p-popover` plus the offset menu seen in the workspace switcher.
 *  - Arbitrary content is projected via `<ng-content>` — no template/content
 *    model beyond "whatever the caller puts inside `<sbb-popover>`".
 *  - `opened`/`closed` outputs mirror `p-popover`'s `(onShow)`/`(onHide)`.
 *
 * Built on `@spartan-ng/brain/popover` (`BrnPopover` + `BrnPopoverContent`,
 * itself layered on `@angular/cdk/overlay`) — brain/CDK types are only used
 * inside this component's own template and are not part of the public API
 * surface.
 */
@Component({
  selector: 'sbb-popover',
  standalone: true,
  imports: [BrnPopover, BrnPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
  exportAs: 'sbbPopover',
  host: {
    class: 'sbb-popover-host',
  },
})
export class SbbPopover {
  /** Horizontal alignment of the panel relative to its trigger. */
  readonly align = input<'start' | 'center' | 'end'>('center');

  /** Vertical gap, in pixels, between the trigger and the panel. */
  readonly sideOffset = input<number>(4);

  /** Emits once the panel has finished opening. */
  @Output() readonly opened = new EventEmitter<void>();

  /** Emits once the panel has finished closing. */
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild(BrnPopover, { static: true })
  private readonly overlay!: BrnPopover;

  /** Anchors the panel to `origin` and opens it (no-op if already open). */
  open(origin: HTMLElement): void {
    this.overlay.setOrigin(origin);
    this.overlay.open();
  }

  /** Closes the panel (no-op if already closed). */
  close(): void {
    this.overlay.close();
  }

  /** Anchors the panel to `origin` and flips its open/closed state. */
  toggle(origin: HTMLElement): void {
    this.overlay.setOrigin(origin);
    this.overlay.toggle();
  }

  /** Whether the panel is currently open. */
  isOpen(): boolean {
    return this.overlay.stateComputed() === 'open';
  }

  protected handleStateChanged(state: 'open' | 'closed'): void {
    if (state === 'open') {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }
}
