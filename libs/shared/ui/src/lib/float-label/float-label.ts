import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Signal,
  computed,
  contentChild,
  input,
} from '@angular/core';

/**
 * Contract a projected control can provide so `SbbFloatLabel` can associate
 * its `<label>` with the control's native element without an explicit `for`.
 * A control provides this token (via `useExisting`) and exposes its rendered
 * `id` as `inputId`.
 */
export interface SbbFloatLabelControl {
  /** Signal resolving to the `id` on the control's native form element. */
  readonly inputId: Signal<string>;
}

/** DI token used by `SbbFloatLabel` to discover its projected control. */
export const SBB_FLOAT_LABEL_CONTROL = new InjectionToken<SbbFloatLabelControl>(
  'SBB_FLOAT_LABEL_CONTROL',
);

/**
 * Float-label wrapper for a single projected form control.
 *
 * Replaces `<p-floatlabel variant="on">`. Every current call site
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
 * `<label for>` semantics used at every current call site). When the projected
 * control provides `SBB_FLOAT_LABEL_CONTROL` (e.g. `sbb-input-number`), the
 * association is wired automatically and `for` becomes optional.
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

  /** Projected control exposing its own `id`, when it provides the token. */
  private readonly control = contentChild(SBB_FLOAT_LABEL_CONTROL);

  /**
   * Resolved `for` target: an explicit `for` input wins, otherwise fall back
   * to the projected control's own generated `id`.
   */
  protected readonly targetId = computed(
    () => this.for() ?? this.control()?.inputId(),
  );
}
