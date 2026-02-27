import { Component, input, model } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-date-picker-signal-form-input',
  imports: [DatePicker, FormsModule],
  templateUrl: './date-picker-signal-form-input.html',
  styleUrl: './date-picker-signal-form-input.scss',
})
export class DatePickerSignalFormInput
  implements FormValueControl<Date | undefined>
{
  value = model<Date | undefined>();
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  required = input<boolean>(false);
}
