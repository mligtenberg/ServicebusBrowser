import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogService } from '../dialog.service';
import { DialogOptions } from '../models/dialogOptions';
import { TextboxInputDialogComponent } from '../textbox-input-dialog/textbox-input-dialog.component';

@Component({
  selector: 'app-textbox-dialog-input',
  templateUrl: './textbox-dialog-input.component.html',
  styleUrls: ['./textbox-dialog-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxDialogInputComponent),
      multi: true
    }
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

  constructor(private dialog: DialogService) { }

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
    const options = new DialogOptions();
    options.set("text", this._value);

    const sub = this.dialog.openDialog<TextboxInputDialogComponent, string>(TextboxInputDialogComponent, options).afterClosed()
    .subscribe((v) => {
      this.value = v;
      sub.unsubscribe();
    })
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
