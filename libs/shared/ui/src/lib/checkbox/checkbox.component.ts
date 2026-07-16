import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * `SbbCheckbox` — a styled, opinionated-minimal boolean checkbox built on a
 * native `<button role="checkbox">`.
 *
 * Derived from current call sites (all `p-checkbox … [binary]="true"` bound
 * via `formControlName`, paired with an external `<label for="…">`):
 *  - Boolean value only (no tri-state form value; `indeterminate` is a purely
 *    visual affordance for "some but not all" scenarios, e.g. select-all).
 *  - `label` renders an associated, clickable label (matches the current
 *    pattern of `p-checkbox` + sibling `<label>`).
 *  - `disabled` mirrors the current `[binary]` usage; also driven via CVA
 *    `setDisabledState` when used with `formControlName`/`formControl`.
 *
 * Implements `ControlValueAccessor` so it can be used with
 * `formControlName` / `[formControl]` / `[(ngModel)]` exactly like the
 * PrimeNG checkbox it replaces.
 */
@Component({
  selector: 'sbb-checkbox',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbCheckbox),
      multi: true,
    },
  ],
})
export class SbbCheckbox implements ControlValueAccessor {
  private static nextId = 0;

  /** Visible label text rendered next to the checkbox. */
  readonly label = input<string>('');

  /**
   * Accessible name for the control. Required when no visible `label` is set
   * (e.g. a bare checkbox inside an input-group addon) so the button still has
   * a discernible name; ignored when a visible `label` is present, which is
   * wired up as the accessible name instead.
   */
  readonly ariaLabel = input<string>('');

  /** Whether the checkbox is disabled. Also settable via CVA (form control). */
  readonly disabled = input(false);

  /** Visual-only indeterminate ("mixed") state; does not affect the CVA value. */
  readonly indeterminate = input(false);

  /** Stable id for the visible label element, used for `aria-labelledby`. */
  protected readonly labelId = `sbb-checkbox-label-${SbbCheckbox.nextId++}`;

  /**
   * Accessible name wiring: when a visible `label` is rendered, associate it
   * via `aria-labelledby`; otherwise fall back to the explicit `ariaLabel`.
   * Either way the `role="checkbox"` button gets a discernible name.
   */
  protected readonly labelledBy = computed(() => (this.label() ? this.labelId : null));
  protected readonly ariaLabelAttr = computed(() => (this.label() ? null : this.ariaLabel() || null));

  private readonly disabledFromCva = signal(false);

  /** Effective disabled state: `disabled` input OR CVA `setDisabledState`. */
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledFromCva());

  protected readonly checked = signal(false);

  private onChange: (value: boolean) => void = () => {
    /* noop until registered */
  };
  private onTouched: () => void = () => {
    /* noop until registered */
  };

  protected onCheckedChange(checked: boolean): void {
    this.checked.set(checked);
    this.onChange(checked);
  }

  protected onTouchedHandler(): void {
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromCva.set(isDisabled);
  }
}
