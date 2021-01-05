import { Component, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-duration-input',
  templateUrl: './duration-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputComponent),
      multi: true
    }
  ],
  styleUrls: ['./duration-input.component.scss']
})
export class DurationInputComponent implements ControlValueAccessor, OnDestroy {
  form: FormGroup;
  isDisabled: boolean = false;

  private onChange: (_: string) => void;
  private onTouched: () => void;
  private _value: moment.Duration;
  private subs = new Subscription();
  
  get value(): moment.Duration {
    return this._value;
  }

  set value(v: moment.Duration) {
    this._value = v;
    if (this.onChange) {
      this.onChange(v.toISOString());
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
      years: 0
    });

    this.subs.add(this.form.valueChanges.subscribe((v) => {
      this.value = moment.duration(v);
    }));
  }

  writeValue(obj: any): void {
    this._value = moment.duration(obj as string);
    this.form.setValue({
      seconds: this._value.seconds(),
      minutes: this._value.minutes(),
      hours: this._value.hours(),
      days: this._value.days(),
      weeks: this._value.weeks(),
      months: this._value.months(),
      years: this._value.years()
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if(isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
