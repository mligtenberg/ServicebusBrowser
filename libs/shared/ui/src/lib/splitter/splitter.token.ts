import { InjectionToken, Signal } from '@angular/core';
import { SbbSplitterLayout } from './splitter.models';
import { SbbSplitterPanel } from './splitter-panel.component';

/**
 * Internal contract between `SbbSplitter` and its `SbbSplitterPanel` children.
 * Not exported from the public barrel — implementation detail only.
 */
export interface SbbSplitterGroupContract {
  readonly orientation: Signal<SbbSplitterLayout>;
  /** True when `panel` is not the last panel currently registered in the group. */
  hasHandleAfter(panel: SbbSplitterPanel): boolean;
  /**
   * Begin a pointer drag on the gutter that follows `panel`. Delegates to the
   * underlying resizable group's `startResize` with this panel's index, so we do
   * not depend on the primitive handle's DOM-sibling index heuristic (which our
   * handle-inside-panel markup breaks).
   */
  startResizeFromPanel(panel: SbbSplitterPanel, event: MouseEvent | TouchEvent): void;
  /**
   * Keyboard resize of the gutter after `panel`. `delta` is a signed percentage
   * moved from the panel to its neighbour (negative shrinks `panel`).
   */
  nudgeAfter(panel: SbbSplitterPanel, delta: number): void;
  /** Current size (percentage) of `panel`, reactive to drag/keyboard resizing. */
  sizeFor(panel: SbbSplitterPanel): number;
}

export const SBB_SPLITTER_GROUP = new InjectionToken<SbbSplitterGroupContract>(
  'SbbSplitterGroup',
);
