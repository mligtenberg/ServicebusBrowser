import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
 * Built on a native `role="radiogroup"` of `role="radio"` buttons with a
 * roving tabindex, following the standard single-select toolbar pattern.
 */
@Component({
  selector: 'sbb-select-button',
  standalone: true,
  imports: [],
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

  /**
   * Roving-tabindex target: the selected option if it's enabled, otherwise
   * the first enabled option. `-1` if every option is disabled.
   */
  protected readonly focusableIndex = computed(() => {
    const options = this.normalizedOptions();
    const selectedIndex = options.findIndex((option) => option.value === this.value());
    if (selectedIndex >= 0 && !(options[selectedIndex].disabled ?? false)) {
      return selectedIndex;
    }
    return options.findIndex((option) => !(option.disabled ?? false));
  });

  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected isOptionDisabled(option: SbbSelectOption<T>): boolean {
    return this.isDisabled() || (option.disabled ?? false);
  }

  protected handleValueChange(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected handleTouched(): void {
    this.onTouched();
  }

  /** Arrow-key roving selection, following the standard toolbar/radiogroup pattern. */
  protected onOptionKeydown(event: KeyboardEvent, index: number): void {
    const options = this.normalizedOptions();
    let step: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        step = 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        step = -1;
        break;
      default:
        return;
    }
    event.preventDefault();
    for (let i = 1; i <= options.length; i++) {
      const nextIndex = (index + step * i + options.length) % options.length;
      if (!this.isOptionDisabled(options[nextIndex])) {
        this.handleValueChange(options[nextIndex].value);
        this.optionButtons()[nextIndex]?.nativeElement.focus();
        return;
      }
    }
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
