import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/**
 * `SbbPopover` — a styled overlay panel anchored to an external trigger
 * element, projecting arbitrary content.
 *
 * Opinionated-minimal replacement for `p-popover`. Public API derived from
 * current call sites (tasks summary, workspace switcher, send-message /
 * batch-resend system-property editors):
 *  - The popover itself renders no trigger — callers wire an arbitrary
 *    element's `(click)` to `toggle()` via a template reference variable
 *    (`#pop`, `pop.toggle($event.currentTarget)`).
 *  - `align` controls horizontal alignment relative to the trigger
 *    (`'start' | 'center' | 'end'`); `sideOffset` the vertical gap.
 *  - Arbitrary content is projected via `<ng-content>`.
 *  - `opened`/`closed` outputs mirror `p-popover`'s `(onShow)`/`(onHide)`.
 *
 * Built on the **native HTML Popover API** (`popover="auto"` → top-layer
 * rendering, light-dismiss and Escape for free) plus **CSS anchor
 * positioning** (a per-instance `anchor-name` is stamped onto the trigger and
 * the panel's `position-anchor` points at it). No CDK overlay, no
 * the browser does the positioning, flipping and
 * dismissal.
 *
 * The native `toggle` event is the single source of truth for open state, so
 * light-dismiss/Escape stay in sync. Environments without the Popover API
 * (e.g. jsdom under tests) transparently fall back to a plain state signal.
 */
@Component({
  selector: 'sbb-popover',
  standalone: true,
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

  /** The native popover mode to use. */
  readonly mode = input<'auto' | 'manual'>('auto');

  /** Emits once the panel has opened. */
  readonly opened = output<void>();

  /** Emits once the panel has closed. */
  readonly closed = output<void>();

  private readonly panelRef =
    viewChild.required<ElementRef<HTMLElement>>('panel');

  private static nextId = 0;

  /**
   * Unique CSS `anchor-name` for this instance. Anchor names are dashed-idents;
   * it is stamped onto the trigger element while the panel is open and removed
   * on close so it doesn't linger on the trigger's inline style.
   */
  protected readonly anchorName = `--sbb-popover-${SbbPopover.nextId++}`;

  /**
   * Open state. Driven by the native `toggle` event (or set directly in the
   * fallback path). Deliberately lags the live DOM state — see {@link toggle}.
   */
  private readonly openState = signal(false);

  private currentOrigin: HTMLElement | undefined;

  /** Anchors the panel to `origin` and opens it (no-op if already open). */
  open(origin: HTMLElement): void {
    console.log('[POP open]', new Error().stack?.split('\n').slice(1,4).join(' | '));
    const panel = this.panelRef().nativeElement;
    if (this.supportsPopover(panel)) {
      if (panel.matches(':popover-open')) {
        return;
      }
      this.anchorTo(origin);
      panel.showPopover();
    } else if (!this.openState()) {
      this.anchorTo(origin);
      this.setOpen(true);
    }
  }

  /** Closes the panel (no-op if already closed). */
  close(): void {
    console.log('[POP close]', new Error().stack?.split('\n').slice(1,4).join(' | '));
    const panel = this.panelRef().nativeElement;
    if (this.supportsPopover(panel) && panel.matches(':popover-open')) {
      panel.hidePopover();
    } else {
      // DOM already closed (e.g. light-dismissed) or unsupported — sync state.
      this.setOpen(false);
    }
  }

  /** Anchors the panel to `origin` and flips its open/closed state. */
  toggle(origin: HTMLElement): void {
    // Decide on our (deliberately lagging) signal, not the live DOM state: when
    // the trigger is re-clicked, the browser's light-dismiss has synchronously
    // closed the panel but the async `toggle` event hasn't updated `openState`
    // yet, so it still reads true → we close instead of reopening.
    if (this.openState()) {
      this.close();
    } else {
      this.open(origin);
    }
  }

  /** Whether the panel is currently open. */
  isOpen(): boolean {
    return this.openState();
  }

  /** Native `toggle` event — the source of truth for open state. */
  protected onToggle(event: Event): void {
    this.setOpen((event as ToggleEvent).newState === 'open');
  }

  private setOpen(open: boolean): void {
    if (open === this.openState()) {
      return;
    }
    this.openState.set(open);
    if (open) {
      this.opened.emit();
    } else {
      this.releaseAnchor();
      this.closed.emit();
    }
  }

  private anchorTo(origin: HTMLElement): void {
    this.currentOrigin = origin;
    origin.style.setProperty('anchor-name', this.anchorName);
    const panel = this.panelRef().nativeElement;
    panel.style.setProperty('position-anchor', this.anchorName);
    panel.style.setProperty('--sbb-popover-offset', `${this.sideOffset()}px`);
  }

  private releaseAnchor(): void {
    this.currentOrigin?.style.removeProperty('anchor-name');
    this.currentOrigin = undefined;
  }

  private supportsPopover(el: HTMLElement): boolean {
    return typeof el.showPopover === 'function';
  }
}
