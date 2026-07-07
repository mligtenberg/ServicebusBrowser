import { InjectionToken } from '@angular/core';

/**
 * Minimal contract `SbbAccordionPanel` needs from its enclosing `SbbAccordion`
 * to coordinate single/multiple expansion. Internal — not part of the public
 * barrel export.
 */
export interface SbbAccordionHost {
  notifyOpened(panel: object): void;
  notifyClosed(panel: object): void;
  registerPanel(panel: object, close: () => void): void;
  unregisterPanel(panel: object): void;
}

/** DI token a `SbbAccordionPanel` uses to (optionally) find its parent `SbbAccordion`. */
export const SBB_ACCORDION = new InjectionToken<SbbAccordionHost>('SBB_ACCORDION');
