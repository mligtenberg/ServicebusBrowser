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
}

export const SBB_SPLITTER_GROUP = new InjectionToken<SbbSplitterGroupContract>(
  'SbbSplitterGroup',
);
