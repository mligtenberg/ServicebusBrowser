import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { TextboxInputDialogComponent } from '../textbox-input-dialog/textbox-input-dialog.component';
import { DialogsService } from '../dialogs/dialogs.service';

@Component({
    selector: 'app-textbox-dialog-input',
    templateUrl: './textbox-dialog-input.component.html',
    styleUrls: ['./textbox-dialog-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextboxDialogInputComponent),
            multi: true,
        },
    ],
})
export class TextboxDialogInputComponent implements ControlValueAccessor, OnDestroy {
    @Input()
    label: string;

    isDisabled: boolean = false;

    private onChange: (_: string) => void;
    private onTouched: () => void;

    private _value: string;
    private subs = new Subscription();

    get value(): string {
        return this._value;
    }

    set value(v: string) {
        this._value = v;
        if (this.onChange) {
            this.onChange(v);
        }
        if (this.onTouched) {
            this.onTouched();
        }
    }

    constructor(private dialog: DialogsService) {}

    writeValue(obj: any): void {
        this._value = obj;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    openEditDialog() {
        this.dialog
            .open<string>(TextboxInputDialogComponent, {
                data: this._value,
            })
            .closed.pipe(take(1))
            .subscribe((v) => {
                this.value = v;
            });
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
