import { Component, computed, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import {
  required,
  disabled as formDisabled,
  form,
  FormField,
  FormValueControl,
} from '@angular/forms/signals';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  SbbButton,
  SbbCheckbox,
  SbbInput,
  SbbInputGroup,
  SbbInputGroupAddon,
  SbbInputNumber,
} from '@service-bus-browser/shared-ui';
import {
  dateFilterTypes,
  numberFilterTypes,
  propertyTypes,
  stringFilterTypes,
} from '../options';
import { SelectSignalFormInput } from '../../form/select-signal-form-input/select-signal-form-input';
import { DatePickerSignalFormInput } from '../../form/date-picker-signal-form-input/date-picker-signal-form-input';
import { formHelpers } from '../../form-helpers';
import { PropertyFilter } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-application-property-form',
  imports: [
    SbbInputGroup,
    SbbInputGroupAddon,
    SbbCheckbox,
    FormField,
    SbbInput,
    SbbInputNumber,
    SbbButton,
    SelectSignalFormInput,
    DatePickerSignalFormInput,
  ],
  templateUrl: './application-property-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './application-property-form.scss',
})
export class ApplicationPropertyForm
  implements FormValueControl<PropertyFilter>
{
  formHelpers = formHelpers;
  value = model<PropertyFilter>({
    value: '',
    fieldType: 'string',
    filterType: 'equals',
    fieldName: '',
    isActive: true,
  });

  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  touched = model<boolean>(false);
  required = input<boolean>(false);
  removable = input<boolean>(false);

  availableApplicationProperties = input.required<
    {
      label: string;
      type: string;
    }[]
  >();
  systemApplicationOptions = computed(() => {
    return this.availableApplicationProperties().map((prop) => {
      return {
        label: prop.label,
        value: prop.label,
      };
    });
  });

  suggestions = computed(() => {
    return this.availableApplicationProperties().map((prop) => {
      return {
        label: prop.label,
        value: prop.label,
      };
    });
  });

  removedPressed = output<void>();
  protected readonly propertyTypes = propertyTypes;

  propertyForm = form(this.value, (v) => {
    if (this.required()) {
      required(v.fieldName);
      required(v.fieldType);
      required(v.filterType);
    }

    if (this.disabled()) {
      formDisabled(v);
    }
  });

  protected onApplicationPropertyChange($event: string | undefined) {
    console.log('onApplicationPropertyChange', $event);
    const availableSystemProperties = this.availableApplicationProperties();
    const item = availableSystemProperties.find(
      (option) => option.label === $event,
    );
    this.setApplicationPropertyType(
      (item?.type as
        | 'string'
        | 'date'
        | 'number'
        | 'boolean'
        | 'timespan'
        | undefined) ?? 'string',
    );
  }

  private setApplicationPropertyType(
    type: 'string' | 'date' | 'number' | 'boolean' | 'timespan',
  ) {
    this.value.update(
      (filter) =>
        ({
          ...filter,
          fieldType: type,
        }) as PropertyFilter,
    );
  }

  protected readonly stringFilterTypes = stringFilterTypes;
  protected readonly dateFilterTypes = dateFilterTypes;
  protected readonly numberFilterTypes = numberFilterTypes;
  protected readonly removeIcon = faTrash;

  protected remove() {
    this.removedPressed.emit();
  }
}
