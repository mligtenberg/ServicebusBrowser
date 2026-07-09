import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnToggleGroupImports } from '@spartan-ng/brain/toggle-group';
import { SbbSelectOption } from '../select';

/**
 * `SbbSelectButton` — a styled, `ControlValueAccessor`-compliant single-select
 * segmented button group.
 *
 * Opinionated-minimal replacement for PrimeNG's `p-select-button`. Public API
 * derived from the current call sites:
 *  - `receive-messages-dialog`: `[options]="string[]"` bound via
 *    `[ngModel]`/`(ngModelChange)` — single-select over plain string values.
 *  - `body-viewer`: `[(ngModel)]` with `[options]="{label,value}[]"`
 *    (`optionLabel`/`optionValue`), `[disabled]`, and `size="small"`.
 *
 * `options` accepts EITHER a flat list of `SbbSelectOption<T>`
 * (`{ label, value, disabled? }`) objects OR a flat list of plain `T` values
 * (each rendered as its own label), mirroring how `SbbSelect` normalizes
 * plain-vs-object options.
 *
 * Built on `@spartan-ng/brain/toggle-group` in `type="single"`, non-nullable
 * mode. brain's toggle-group is itself a `ControlValueAccessor`; this component
 * wraps it and never exposes brain/CDK types on its public API.
 */
@Component({
  selector: 'sbb-select-button',
  standalone: true,
  imports: [BrnToggleGroupImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-button.html',
  styleUrl: './select-button.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbSelectButton),
      multi: true,
    },
  ],
  host: {
    class: 'sbb-select-button-host',
  },
})
export class SbbSelectButton<T> implements ControlValueAccessor {
  /**
   * Options rendered as buttons. Either `SbbSelectOption<T>` objects
   * (`{ label, value, disabled? }`) or plain `T` values.
   */
  readonly options = input<readonly SbbSelectOption<T>[] | readonly T[]>([]);

  /** Disables the whole group. Also settable via CVA (form control). */
  readonly disabled = input(false);

  /** Button size. Defaults to `'medium'`. */
  readonly size = input<'small' | 'medium'>('medium');

  /** Current value, reflected from the CVA and by user selection. */
  protected readonly value = signal<T | null>(null);

  private readonly disabledFromCva = signal(false);

  /** Effective disabled state: `disabled` input OR CVA `setDisabledState`. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledFromCva(),
  );

  /** Normalizes plain values and option objects into a uniform structure. */
  protected readonly normalizedOptions = computed<SbbSelectOption<T>[]>(() =>
    this.options().map((entry) => {
      if (entry !== null && typeof entry === 'object' && 'value' in entry) {
        return entry as SbbSelectOption<T>;
      }
      return { label: String(entry), value: entry as T };
    }),
  );

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected handleValueChange(value: unknown): void {
    const next = (value ?? null) as T | null;
    this.value.set(next);
    this.onChange(next);
  }

  protected handleTouched(): void {
    this.onTouched();
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromCva.set(isDisabled);
  }
}
