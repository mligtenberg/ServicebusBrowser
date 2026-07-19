import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';
import { SbbDatePicker } from '@service-bus-browser/shared-ui';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-date-picker-signal-form-input',
  imports: [SbbDatePicker, FormsModule],
  templateUrl: './date-picker-signal-form-input.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
