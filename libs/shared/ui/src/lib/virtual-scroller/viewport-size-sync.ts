import { effect, Signal } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

/**
 * Keep a `cdk-virtual-scroll-viewport`'s cached size in sync with its actual
 * rendered size.
 *
 * CDK measures the viewport once and then only re-measures on *window* resize
 * (it subscribes to `ViewportRuler.change()`). When a viewport grows because of
 * an element-level layout change instead — a splitter drag, a details pane
 * collapsing, a container animating open — the cached size stays stale, and the
 * fixed-size strategy keeps deriving the rendered range from the old, smaller
 * height:
 *
 * ```
 * end = ceil((scrollOffset + staleViewportSize) / itemSize)
 * ```
 *
 * At the bottom of the list that end lands short of the data length, so the
 * last `(realSize - staleSize) / itemSize` items are never rendered and cannot
 * be reached by scrolling at all — they simply vanish. The taller the viewport
 * got, the more of them disappear.
 *
 * A `ResizeObserver` on the viewport element closes that gap. Must be called
 * from an injection context (i.e. a field initialiser or constructor).
 *
 * @param viewport signal holding the viewport (typically a `viewChild`).
 */
export function syncViewportSize(
  viewport: Signal<CdkVirtualScrollViewport | undefined>,
): void {
  effect((onCleanup) => {
    const vp = viewport();
    if (!vp) {
      return;
    }
    // No layout to observe outside a real browser (SSR, jsdom tests).
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const element = vp.elementRef.nativeElement;
    // Fires once on `observe()` with the current size too, which also corrects
    // a viewport that was measured before its container had settled.
    const observer = new ResizeObserver(() => vp.checkViewportSize());
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });
}
