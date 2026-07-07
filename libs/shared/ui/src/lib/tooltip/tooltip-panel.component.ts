import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Internal presentational component rendered inside the CDK overlay by
 * `SbbTooltip`. Not exported from the sub-barrel — implementation detail.
 */
@Component({
  selector: 'sbb-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="sbb-tooltip-panel__text">{{ text() }}</span>`,
  styles: [
    `
      :host {
        display: block;
        max-width: 20rem;
        padding: 0.375rem 0.625rem;
        border-radius: var(--sbb-radius);
        background: var(--sbb-tooltip-surface, var(--sbb-gray-900));
        color: var(--sbb-tooltip-text, #ffffff);
        font-size: 0.8125rem;
        line-height: 1.3;
        box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
        pointer-events: none;
        word-break: break-word;
      }
    `,
  ],
})
export class SbbTooltipPanel {
  readonly text = input.required<string>();
}
