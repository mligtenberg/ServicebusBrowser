import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'lib-auto-complete-form-input',
  imports: [FormsModule, AutoComplete],
  templateUrl: './auto-complete-form-input.html',
  styleUrl: './auto-complete-form-input.scss',
})
export class AutoCompleteFormInput<T>
  implements FormValueControl<T | undefined>
{
  value = model<T>();
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  required = input<boolean>(false);

  suggestions = input<T[]>();
  completeMethod = output<AutoCompleteCompleteEvent>();
  hide = output<void>();
}
