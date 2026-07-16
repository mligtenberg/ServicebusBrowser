import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { SbbSelect, SbbSelectOption } from '@service-bus-browser/shared-ui';

@Component({
  selector: 'lib-select-signal-form-input',
  imports: [SbbSelect, FormsModule],
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

  /**
   * Maps the `options` + `optionLabel`/`optionValue` key-pair
   * (kept as-is on this component's public API) onto `SbbSelect`'s
   * `SbbSelectOption<T>[]` shape. Falls back to the raw entry when a key is
   * not supplied, mirroring `p-select`'s behaviour of using the whole object
   * (and its string conversion) when `optionLabel`/`optionValue` are unset.
   */
  protected readonly sbbOptions = computed<SbbSelectOption<T>[]>(() => {
    const options = this.options() ?? [];
    const labelKey = this.optionLabel();
    const valueKey = this.optionValue();

    return options.map((option) => ({
      label: labelKey !== undefined ? String(option[labelKey]) : String(option),
      value: (valueKey !== undefined ? option[valueKey] : option) as T,
    }));
  });
}
