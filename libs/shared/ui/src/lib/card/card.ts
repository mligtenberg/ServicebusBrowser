import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `SbbCard` — a styled structural card surface.
 *
 * Opinionated-minimal API distilled from the current `p-card` call sites
 * across the app: every call site sets only a plain string `header` and
 * projects arbitrary body content (forms, tables, text) via default content
 * projection. No call site uses subtitle/footer/header-template
 * regions, so this wrapper does not expose them.
 *
 * Pure display component — no behavior beyond rendering the header + body.
 *
 * Usage:
 * ```html
 * <sbb-card header="Queue Properties">
 *   <form [formGroup]="form">...</form>
 * </sbb-card>
 *
 * <sbb-card>
 *   <p>No header needed.</p>
 * </sbb-card>
 * ```
 */
@Component({
  selector: 'sbb-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    class: 'sbb-card-host',
  },
})
export class SbbCard {
  /** Card header title text. Omit to render a card with no header region. */
  readonly header = input<string | undefined>(undefined);
}
