import { Component, input, model } from '@angular/core';
import { Select } from 'primeng/select';
import {
  FormValueControl,
} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-select-signal-form-input',
  imports: [Select, FormsModule],
  templateUrl: './select-signal-form-input.html',
  styleUrl: './select-signal-form-input.scss',
})
export class SelectSignalFormInput<T>
  implements FormValueControl<T | undefined>
{
  value = model<T>();
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  required = input<boolean>(false);

  options = input<Record<string, T | string>[]>();
  optionLabel = input<string>();
  optionValue = input<string>();
  placeholder = input<string>();
}
