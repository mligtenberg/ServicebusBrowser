import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, model } from '@angular/core';
import { SBB_ACCORDION } from './accordion.token';

let nextPanelId = 0;

/**
 * `SbbAccordionPanel` — a single expandable panel used inside `SbbAccordion`.
 *
 * Derived from current call sites (`p-accordion-panel` + `p-accordion-header`
 * + `p-accordion-content`):
 *  - Header content (title + optional trailing tag/badge) is projected via
 *    the `sbbAccordionPanelHeader` content-projection slot.
 *  - Body content is the panel's default projected content.
 *  - Expand state is a plain `boolean` signal input/output pair (`open` /
 *    `openChange` via `model()`) — no internal ids or `value` strings are
 *    exposed on the public API.
 *  - `disabled` mirrors PrimeNG's ability to prevent a panel from being
 *    toggled by the user.
 *
 * Built on native disclosure markup (`<button aria-expanded>` +
 * `role="region"`) rather than `@spartan-ng/brain`'s headless accordion — see
 * the note on `SbbAccordion` for why brain's directive-based API doesn't fit
 * a content-projected panel component.
 */
@Component({
  selector: 'sbb-accordion-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3 class="sbb-accordion-panel__heading">
      <button
        type="button"
        class="sbb-accordion-panel__trigger"
        [id]="triggerId"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="contentId"
        [attr.aria-disabled]="disabled() || null"
        [disabled]="disabled()"
        (click)="toggle()"
      >
        <span class="sbb-accordion-panel__title"><ng-content select="[sbbAccordionPanelHeader]" /></span>
        <svg class="sbb-accordion-panel__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </h3>
    <div
      class="sbb-accordion-panel__content"
      role="region"
      [id]="contentId"
      [attr.aria-labelledby]="triggerId"
      [class.sbb-accordion-panel__content--open]="open()"
    >
      <div class="sbb-accordion-panel__content-inner">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './accordion-panel.component.scss',
})
export class SbbAccordionPanel {
  private readonly id = `sbb-accordion-panel-${++nextPanelId}`;
  protected readonly triggerId = `${this.id}-trigger`;
  protected readonly contentId = `${this.id}-content`;

  private readonly accordion = inject(SBB_ACCORDION, { optional: true });

  /** Whether this panel is expanded. Two-way bindable via `[(open)]`. @default false */
  readonly open = model(false);

  /** Whether this panel can be toggled by the user. @default false */
  readonly disabled = input(false);

  constructor() {
    this.accordion?.registerPanel(this, () => this.open.set(false));
    inject(DestroyRef).onDestroy(() => this.accordion?.unregisterPanel(this));
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.accordion?.notifyOpened(this);
    } else {
      this.accordion?.notifyClosed(this);
    }
  }
}
