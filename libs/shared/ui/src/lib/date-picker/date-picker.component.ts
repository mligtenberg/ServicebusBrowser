import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * `SbbDatePicker` — a styled, `ControlValueAccessor`-compliant date (and
 * optionally time) picker over `Date | undefined`.
 *
 * Opinionated-minimal replacement for `<p-date-picker>`, distilled
 * from the current call sites — all of which use `showTime` to pick a date
 * plus a 24-hour time and bind a `Date` via `[(ngModel)]`.
 *
 * Implementation note: this wraps a native `<input type="datetime-local">`
 * (or `type="date"` when `showTime` is false) rather than the headless
 * a calendar. The calendar is a large grid assembly that
 * additionally requires `brnSelect`-based month/year pickers and separate time
 * handling; the native control delivers the full date+time behaviour every
 * call site needs today. Because the CDK detail never surfaced in the
 * public API to begin with, swapping the internals for a brain calendar later
 * (for richer theming) is a localised change behind this same API. Values are
 * formatted/parsed in LOCAL time to match the native control.
 */
@Component({
  selector: 'sbb-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbDatePicker),
      multi: true,
    },
  ],
  host: { class: 'sbb-date-picker-host' },
})
export class SbbDatePicker implements ControlValueAccessor {
  /** When true, also pick a 24-hour time (native `datetime-local`). */
  readonly showTime = input(false);

  /** Placeholder text shown when empty. */
  readonly placeholder = input('');

  /** Disables the control. Also settable via CVA. */
  readonly disabled = input(false);

  /** Renders the field read-only. */
  readonly readonly = input(false);

  /** Marks the field as required. */
  readonly required = input(false);

  /** Earliest selectable date. */
  readonly min = input<Date | undefined>(undefined);

  /** Latest selectable date. */
  readonly max = input<Date | undefined>(undefined);

  /** Native input type derived from `showTime`. */
  protected readonly inputType = computed(() =>
    this.showTime() ? 'datetime-local' : 'date',
  );

  /** The current value as a native-input string. */
  protected readonly displayValue = signal('');

  private readonly disabledFromCva = signal(false);

  /** Effective disabled state: `disabled` input OR CVA `setDisabledState`. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledFromCva(),
  );

  protected readonly minString = computed(() => this.format(this.min()));
  protected readonly maxString = computed(() => this.format(this.max()));

  private onChange: (value: Date | undefined) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.displayValue.set(raw);
    this.onChange(this.parse(raw));
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: Date | undefined | null): void {
    this.displayValue.set(this.format(value ?? undefined));
  }

  registerOnChange(fn: (value: Date | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromCva.set(isDisabled);
  }

  /** Formats a `Date` as a local `yyyy-MM-dd`(`THH:mm`) string, or '' if unset. */
  private format(value: Date | undefined): string {
    if (!value || Number.isNaN(value.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
      value.getDate(),
    )}`;
    if (!this.showTime()) {
      return date;
    }
    return `${date}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }

  /** Parses a native-input string into a local `Date`, or undefined if empty/invalid. */
  private parse(raw: string): Date | undefined {
    if (!raw) {
      return undefined;
    }
    const [datePart, timePart] = raw.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) {
      return undefined;
    }
    let hours = 0;
    let minutes = 0;
    if (timePart) {
      const [h, m] = timePart.split(':').map(Number);
      hours = h || 0;
      minutes = m || 0;
    }
    return new Date(year, month - 1, day, hours, minutes);
  }
}
