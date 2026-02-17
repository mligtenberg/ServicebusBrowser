import { Component, computed, effect, forwardRef, input, signal } from '@angular/core';
import { Editor } from '../editor/editor';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'sbb-form-editor',
  imports: [Editor],
  templateUrl: './form-editor.html',
  styleUrl: './form-editor.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormEditor),
      multi: true,
    },
  ],
})
export class FormEditor implements ControlValueAccessor {
  editorOptions =
    input.required<monaco.editor.IStandaloneEditorConstructionOptions>();

  protected value = signal<string>('');
  protected disabled = signal<boolean>(false);

  protected formIncludedEditorOptions = computed(() => {
    return {
      ...this.editorOptions(),
      readOnly: this.disabled(),
    };
  });

  private onChange: ((_: string) => void) | undefined = undefined;

  constructor() {
    effect(() => {
      const value = this.value();
      if (this.onChange) {
        this.onChange(value);
      }
    });
  }

  writeValue(obj: string | undefined): void {
    this.value.set(obj ?? '');
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
