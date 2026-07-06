import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SbbInputSize, SbbInputType } from './input.models';

/**
 * `SbbInput` — a styled, `ControlValueAccessor`-compliant single-line text
 * input.
 *
 * Opinionated-minimal replacement for `pInputText` (native `<input>` styled
 * to match the current PrimeNG look). There is no matching brain primitive
 * for a plain text input, so this wraps a plain native `<input>` element
 * directly rather than any `@spartan-ng/brain`/CDK primitive.
 *
 * Public API derived from current call sites:
 *  - `type`        text/password/email/search/number/tel/url.
 *  - `placeholder` placeholder text.
 *  - `disabled`    disables the control (also driven by the CVA `setDisabledState`).
 *  - `invalid`     applies error styling (parity with PrimeNG's `p-invalid`).
 *  - `size`        `sm` | `md` | `lg`, default `md`.
 */
@Component({
  selector: 'sbb-input',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbInput),
      multi: true,
    },
  ],
  host: {
    class: 'sbb-input-host',
  },
})
export class SbbInput implements ControlValueAccessor {
  /** Native input type. Defaults to `'text'`. */
  readonly type = input<SbbInputType>('text');

  /** Placeholder text shown when the value is empty. */
  readonly placeholder = input<string>('');

  /** Visual size. Defaults to `'md'`. */
  readonly size = input<SbbInputSize>('md');

  /** Applies error/invalid styling (parity with PrimeNG's `p-invalid`). */
  readonly invalid = input<boolean>(false);

  /** Current value, reflected into the native input. */
  protected readonly value = signal('');

  /** Disabled state, settable both via CVA and reflected in the template. */
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected handleInput(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
