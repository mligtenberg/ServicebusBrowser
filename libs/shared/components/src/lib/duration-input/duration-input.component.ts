import { Component, forwardRef, input } from '@angular/core';

import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Duration } from 'luxon';
import { InputGroup } from 'primeng/inputgroup';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'sbb-duration-input',
  imports: [
    ReactiveFormsModule,
    InputGroup,
    InputNumber,
    FloatLabel
],
  templateUrl: './duration-input.component.html',
  styleUrl: './duration-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputComponent),
      multi: true,
    },
  ],
})
export class DurationInputComponent implements ControlValueAccessor {
  inputId = input<string>();
  disableSeconds = input<boolean>();
  disableMinutes = input<boolean>();
  disableHours = input<boolean>();
  disableDays = input<boolean>();
  disableWeeks = input<boolean>();
  disableMonths = input<boolean>();
  disableYears = input<boolean>();

  form = new FormGroup({
    seconds: new FormControl<number>(0, Validators.required),
    minutes: new FormControl<number>(0, Validators.required),
    hours: new FormControl<number>(0, Validators.required),
    days: new FormControl<number>(0, Validators.required),
    weeks: new FormControl<number>(0, Validators.required),
    months: new FormControl<number>(0, Validators.required),
    years: new FormControl<number>(0, Validators.required),
  });
  onChange?: (_: string) => void;
  onTouched?: () => void;

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (this.form.invalid) {
        return;
      }

      const duration = Duration.fromObject({
        seconds: (this.disableSeconds() ? undefined : value.seconds) ?? undefined,
        minutes: (this.disableMinutes() ? undefined : value.minutes) ?? undefined,
        hours: (this.disableHours() ? undefined : value.hours) ?? undefined,
        days: (this.disableDays() ? undefined : value.days) ?? undefined,
        weeks: (this.disableWeeks() ? undefined : value.weeks) ?? undefined,
        months: (this.disableMonths() ? undefined : value.months) ?? undefined,
        years: (this.disableYears() ? undefined : value.years) ?? undefined
      });

      if (this.onChange) {
        this.onChange?.(duration.toISO());
      }

      if (this.onTouched) {
        this.onTouched();
      }
    });
  }

  writeValue(obj: string): void {
    if (!obj) {
      this.form.reset({
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
        weeks: 0,
        months: 0,
        years: 0,
      }, { emitEvent: false });
      return;
    }

    const value = Duration.fromISO(obj);
    if (!value.isValid) {
      this.form.reset({}, { emitEvent: false });
      return;
    }

    this.form.setValue(
      {
        seconds: value.seconds,
        minutes: value.minutes,
        hours: value.hours,
        days: value.days,
        weeks: value.weeks,
        months: value.months,
        years: value.years,
      },
      { emitEvent: false }
    );
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
