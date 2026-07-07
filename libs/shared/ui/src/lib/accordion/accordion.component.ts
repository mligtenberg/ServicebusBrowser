import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SBB_ACCORDION, SbbAccordionHost } from './accordion.token';

/**
 * `SbbAccordion` — styled container for a set of `SbbAccordionPanel`s.
 *
 * Derived from current call sites (`p-accordion [multiple]="true" [value]="[...]"`,
 * `p-accordion-panel`/`p-accordion-header`/`p-accordion-content`):
 *  - Only the single/multiple expansion mode is exposed here; which panel(s)
 *    are open lives on each `SbbAccordionPanel` itself via its own `open`
 *    signal input/output, not on a shared `value` array. This keeps parent
 *    templates declarative (`[open]`/`(openChange)` per panel).
 *
 * Note on implementation: `@spartan-ng/brain`'s headless accordion
 * (`BrnAccordion`/`BrnAccordionItem`) resolves its shared state purely via
 * `inject()` through the *element* injector tree. That tree does not carry
 * across `<ng-content>` projection boundaries the way it would need to for a
 * `SbbAccordionPanel` *component* (rather than a directive applied directly
 * in `SbbAccordion`'s own template) to see its parent accordion — Angular
 * resolves injectors for projected content relative to where the content was
 * originally declared, not where it is projected into. Per the sourcing
 * rule's escape hatch ("if it doesn't cleanly fit, prefer a styled native
 * element + `@angular/cdk`"), this is built on plain native disclosure
 * markup (`<button aria-expanded>` / `role="region"`) coordinated through a
 * small `SbbAccordionHost` DI token, with no CDK overlay/a11y primitive
 * actually required for this interaction pattern.
 */
@Component({
  selector: 'sbb-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: SBB_ACCORDION, useExisting: SbbAccordion }],
  host: {
    class: 'sbb-accordion',
  },
  template: `<ng-content />`,
  styleUrl: './accordion.component.scss',
})
export class SbbAccordion implements SbbAccordionHost {
  /** Whether more than one panel may be expanded at the same time. @default false */
  readonly multiple = input(false);

  private readonly openPanels = new Set<object>();

  /** Called by a panel when the user opens it; closes siblings unless `multiple` is set. */
  notifyOpened(panel: object): void {
    if (!this.multiple()) {
      for (const other of this.openPanels) {
        if (other !== panel) {
          this.closeCallbacks.get(other)?.();
        }
      }
    }
    this.openPanels.add(panel);
  }

  /** Called by a panel when it closes (by the user or programmatically). */
  notifyClosed(panel: object): void {
    this.openPanels.delete(panel);
  }

  private readonly closeCallbacks = new Map<object, () => void>();

  /** Registers the callback a panel exposes so the accordion can force-close it. */
  registerPanel(panel: object, close: () => void): void {
    this.closeCallbacks.set(panel, close);
  }

  /** Cleans up bookkeeping when a panel is destroyed. */
  unregisterPanel(panel: object): void {
    this.closeCallbacks.delete(panel);
    this.openPanels.delete(panel);
  }
}
