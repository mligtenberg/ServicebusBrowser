import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * `SbbInputNumber` — a styled numeric input implementing `ControlValueAccessor`.
 *
 * Opinionated-minimal replacement for `p-inputnumber`. Current call sites
 * (queue/topic/subscription management forms) only ever bind
 * `formControlName` + `inputId` on a plain integer field — no spinner
 * buttons, grouping, or currency/percent formatting are used anywhere in the
 * codebase, so none of that is implemented here. Value type is `number | null`.
 */
@Component({
  selector: 'sbb-input-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbInputNumber),
      multi: true,
    },
  ],
  host: {
    class: 'sbb-input-number',
  },
})
export class SbbInputNumber implements ControlValueAccessor {
  /** `id` applied to the native `<input>`, e.g. for `<label for>`. */
  inputId = input<string>();

  /** Minimum allowed value. */
  min = input<number>();

  /** Maximum allowed value. */
  max = input<number>();

  /** Step increment. Defaults to `1`. */
  step = input<number>(1);

  placeholder = input<string>();

  protected readonly value = signal<number | null>(null);
  protected readonly disabledState = signal(false);

  private onChange?: (value: number | null) => void;
  private onTouched?: () => void;

  protected onInput(raw: string): void {
    const parsed = raw === '' ? null : Number(raw);
    const next = raw !== '' && Number.isNaN(parsed) ? null : parsed;
    this.value.set(next);
    this.onChange?.(next);
  }

  protected onBlur(): void {
    this.onTouched?.();
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }
}
