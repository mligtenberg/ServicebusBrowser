import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Multiline text input.
 *
 * Replaces `pInputTextarea` call sites. Implements
 * `ControlValueAccessor` so it can be used with template-driven and reactive
 * forms alike (`[(ngModel)]` / `formControlName`).
 *
 * This is an OPINIONATED-MINIMAL API — it wraps a plain, styled native
 * `<textarea>`; there is no hidden CDK primitive to leak.
 */
@Component({
  selector: 'sbb-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  host: {
    class: 'sbb-textarea-host',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbTextarea),
      multi: true,
    },
  ],
})
export class SbbTextarea implements ControlValueAccessor {
  /** Number of visible text lines. Defaults to `3`. */
  rows = input<number>(3);

  /** Placeholder text shown when the value is empty. */
  placeholder = input<string>('');

  /** Whether the textarea grows to fit its content instead of scrolling. */
  autoResize = input<boolean>(false);

  /** Forwarded `id` for label association. */
  inputId = input<string | undefined>(undefined);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange?: (value: string) => void;
  private onTouched?: () => void;

  protected onInput(value: string): void {
    this.value.set(value);
    this.onChange?.(value);
  }

  protected onBlur(): void {
    this.onTouched?.();
  }

  writeValue(value: string): void {
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
