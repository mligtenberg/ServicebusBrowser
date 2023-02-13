import { Component, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, UntypedFormBuilder, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Duration } from 'luxon';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-duration-input',
    templateUrl: './duration-input.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DurationInputComponent),
            multi: true,
        },
    ],
    styleUrls: ['./duration-input.component.scss'],
})
export class DurationInputComponent implements ControlValueAccessor, OnDestroy {
    form: UntypedFormGroup;
    isDisabled: boolean = false;

    private onChange: (_: string) => void;
    private onTouched: () => void;
    private _value: Duration;
    private subs = new Subscription();

    get value(): Duration {
        return this._value;
    }

    set value(v: Duration) {
        this._value = v;
        if (this.onChange) {
            this.onChange(v.toISO());
        }
        if (this.onTouched) {
            this.onTouched();
        }
    }

    constructor(formBuilder: UntypedFormBuilder) {
        this.form = formBuilder.group({
            seconds: 0,
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 0,
            months: 0,
            years: 0,
        });

        this.subs.add(
            this.form.valueChanges.subscribe((v) => {
                this.value = Duration.fromObject(v);
            })
        );
    }

    writeValue(obj: any): void {
        if (!obj) {
            return;
        }

        this._value = Duration.fromISO(obj as string);
        this.form.setValue({
            seconds: this._value.seconds,
            minutes: this._value.minutes,
            hours: this._value.hours,
            days: this._value.days,
            weeks: this._value.weeks,
            months: this._value.months,
            years: this._value.years,
        });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.form.disable();
        } else {
            this.form.enable();
        }
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
