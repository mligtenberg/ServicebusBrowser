import { Component, input, model, output, } from '@angular/core';
import {
  required,
  disabled as formDisabled,
  form,
  FormField,
  FormValueControl,
  FieldTree,
} from '@angular/forms/signals';
import { PropertyFilter } from '@service-bus-browser/messages-contracts';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Checkbox } from 'primeng/checkbox';
import {
  dateFilterTypes,
  numberFilterTypes,
  propertyTypes,
  stringFilterTypes,
} from '../options';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { SelectSignalFormInput } from '../select-signal-form-input/select-signal-form-input';
import { DatePickerSignalFormInput } from '../date-picker-signal-form-input/date-picker-signal-form-input';

@Component({
  selector: 'lib-application-property-form',
  imports: [
    InputGroup,
    InputGroupAddon,
    Checkbox,
    FormField,
    InputText,
    Button,
    SelectSignalFormInput,
    DatePickerSignalFormInput,
  ],
  templateUrl: './application-property-form.html',
  styleUrl: './application-property-form.scss',
})
export class ApplicationPropertyForm
  implements FormValueControl<PropertyFilter>
{
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

  protected readonly stringFilterTypes = stringFilterTypes;
  protected readonly dateFilterTypes = dateFilterTypes;
  protected readonly numberFilterTypes = numberFilterTypes;

  protected asStringValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<string, string> {
    return value as FieldTree<string, string>;
  }

  protected asDateValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<Date, string> {
    return value as FieldTree<Date, string>;
  }

  protected asNumberValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<number, string> {
    return value as FieldTree<number, string>;
  }

  protected asBooleanValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<boolean, string> {
    return value as FieldTree<boolean, string>;
  }

  protected remove() {
    this.removedPressed.emit();
  }
}
