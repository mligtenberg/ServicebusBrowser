import { InjectionToken, Signal } from '@angular/core';

/**
 * Internal contract between `SbbTabs` and its `SbbTabPanel` children.
 * Not exported from the public barrel — implementation detail only.
 */
export interface SbbTabsGroupContract {
  /** Unique per-instance id so the group and a panel can independently derive matching tab/panel DOM ids. */
  readonly groupId: string;
  /** The currently selected panel's `value`. */
  readonly activeValue: Signal<string | undefined>;
}

export const SBB_TABS_GROUP = new InjectionToken<SbbTabsGroupContract>('SbbTabsGroup');
