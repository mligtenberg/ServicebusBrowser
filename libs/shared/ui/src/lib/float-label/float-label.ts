import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Float-label wrapper for a single projected form control.
 *
 * Replaces PrimeNG's `<p-floatlabel variant="on">`. Every current call site
 * uses the `"on"` variant only (label always floated, resting on the
 * control's top border) — so this wrapper hard-codes that behaviour instead
 * of exposing a `variant` input.
 *
 * Usage:
 * ```html
 * <sbb-float-label label="Host" for="rabbitMqHost">
 *   <input id="rabbitMqHost" [(ngModel)]="host" />
 * </sbb-float-label>
 * ```
 *
 * The projected control keeps its own `id`; pass the same value via `for` so
 * the generated `<label>` stays associated with it (matches native
 * `<label for>` semantics used at every current call site).
 */
@Component({
  selector: 'sbb-float-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './float-label.html',
  styleUrl: './float-label.scss',
  host: {
    class: 'sbb-float-label',
  },
})
export class SbbFloatLabel {
  /** Visible label text. */
  label = input.required<string>();

  /** `id` of the projected control this label describes (`<label for>`). */
  for = input<string | undefined>(undefined);
}
