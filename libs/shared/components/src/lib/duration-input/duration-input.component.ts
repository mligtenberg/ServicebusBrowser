import { Component, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { IftaLabel } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'sbb-duration-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroup,
    InputNumber,
    FloatLabel,
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
        seconds: value.seconds ?? undefined,
        minutes: value.minutes ?? undefined,
        hours: value.hours ?? undefined,
        days: value.days ?? undefined,
        weeks: value.weeks ?? undefined,
        months: value.months ?? undefined,
        years: value.years ?? undefined,
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
      this.form.reset({}, { emitEvent: false });
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
