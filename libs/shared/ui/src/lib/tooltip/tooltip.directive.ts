import { AriaDescriber } from '@angular/cdk/a11y';
import {
  ConnectedPosition,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { SbbTooltipPanel } from './tooltip-panel.component';
import { SbbTooltipPlacement } from './tooltip.models';

/** Overlay position config per placement, host-anchored, with a sane fallback. */
const POSITIONS: Record<SbbTooltipPlacement, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
};

const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 100;

/**
 * `SbbTooltip` — a directive showing a short text tooltip on hover/focus of
 * its host element, distilled from the current `pTooltip`/`tooltipPosition`
 * call sites (icon-only buttons, truncated labels, action hints).
 *
 * Built directly on `@angular/cdk/overlay` + `@angular/cdk/a11y` — brain's
 * `@spartan-ng/brain/tooltip` secondary entry point ships no public API in
 * the installed version, so it does not fit the sourcing rule's "if it
 * doesn't cleanly fit, prefer CDK" fallback.
 *
 * Usage:
 * ```html
 * <span [sbbTooltip]="node.name">{{ node.name }}</span>
 * <button [sbbTooltip]="'Delete workspace'" sbbTooltipPlacement="top">...</button>
 * ```
 *
 * An empty/undefined `text` suppresses the tooltip entirely (no overlay is
 * created), matching call sites that bind a possibly-empty hint string.
 */
@Directive({
  selector: '[sbbTooltip]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class SbbTooltip implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ariaDescriber = inject(AriaDescriber);

  /** Tooltip text. When falsy/empty, no tooltip is shown. */
  readonly sbbTooltip = input<string | undefined | null>(undefined);

  /** Preferred placement relative to the host. Defaults to `'top'`. */
  readonly placement = input<SbbTooltipPlacement>('top', {
    alias: 'sbbTooltipPlacement',
  });

  private overlayRef: OverlayRef | undefined;
  private panelRef: ComponentRef<SbbTooltipPanel> | undefined;
  private showTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private describedText: string | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.destroy());

    // Keeps the host's accessible description (surfaced to screen readers
    // via `aria-describedby`) in sync with the tooltip text, independent of
    // whether the visual overlay is currently shown.
    effect(() => {
      const text = this.sbbTooltip();
      if (this.describedText) {
        this.ariaDescriber.removeDescription(
          this.elementRef.nativeElement,
          this.describedText,
        );
        this.describedText = undefined;
      }
      if (text) {
        this.ariaDescriber.describe(this.elementRef.nativeElement, text);
        this.describedText = text;
      }
    });
  }

  protected onMouseEnter(): void {
    this.scheduleShow();
  }

  protected onMouseLeave(): void {
    this.scheduleHide();
  }

  protected onFocus(): void {
    this.scheduleShow();
  }

  protected onBlur(): void {
    this.scheduleHide();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private scheduleShow(): void {
    const text = this.sbbTooltip();
    if (!text) {
      return;
    }
    this.clearTimers();
    this.showTimeoutId = setTimeout(() => this.show(text), SHOW_DELAY_MS);
  }

  private scheduleHide(): void {
    this.clearTimers();
    this.hideTimeoutId = setTimeout(() => this.hide(), HIDE_DELAY_MS);
  }

  private clearTimers(): void {
    if (this.showTimeoutId !== undefined) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = undefined;
    }
    if (this.hideTimeoutId !== undefined) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = undefined;
    }
  }

  private show(text: string): void {
    if (!this.overlayRef) {
      this.overlayRef = this.createOverlay();
    }
    if (!this.panelRef) {
      const portal = new ComponentPortal(SbbTooltipPanel);
      this.panelRef = this.overlayRef.attach(portal);
    }
    this.panelRef.setInput('text', text);
  }

  private hide(): void {
    this.overlayRef?.detach();
    this.panelRef = undefined;
  }

  private createOverlay(): OverlayRef {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(POSITIONS[this.placement()])
      .withPush(true);

    return this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'sbb-tooltip-overlay-pane',
    });
  }

  private destroy(): void {
    this.clearTimers();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.panelRef = undefined;
    if (this.describedText) {
      this.ariaDescriber.removeDescription(
        this.elementRef.nativeElement,
        this.describedText,
      );
      this.describedText = undefined;
    }
  }
}
