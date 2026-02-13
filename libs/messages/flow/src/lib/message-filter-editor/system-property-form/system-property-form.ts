import { Component, inject, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePickerSignalFormInput } from '../date-picker-signal-form-input/date-picker-signal-form-input';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { SelectSignalFormInput } from '../select-signal-form-input/select-signal-form-input';
import { FieldTree, form, FormField, FormValueControl, required, disabled as formDisabled } from '@angular/forms/signals';
import {
  PropertyFilter,
  SystemPropertyKey,
} from '@service-bus-browser/messages-contracts';
import { SystemPropertyHelpers } from '../../systemproperty-helpers';
import {
  dateFilterTypes,
  numberFilterTypes,
  stringFilterTypes,
  systemPropertyOptions,
  timespanFilterTypes,
} from '../options';

@Component({
  selector: 'lib-system-property-form',
  imports: [
    Button,
    Checkbox,
    DatePickerSignalFormInput,
    DurationInputComponent,
    InputGroup,
    InputGroupAddon,
    InputText,
    Popover,
    SelectSignalFormInput,
    FormField,
  ],
  templateUrl: './system-property-form.html',
  styleUrl: './system-property-form.scss',
})
export class SystemPropertyForm implements FormValueControl<PropertyFilter> {
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

  systemPropertyHelpers = inject(SystemPropertyHelpers);

  stringFilterTypes = stringFilterTypes;
  dateFilterTypes = dateFilterTypes;
  numberFilterTypes = numberFilterTypes;
  timespanFilterTypes = timespanFilterTypes;
  systemPropertyOptions = systemPropertyOptions;

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

  protected onSystemPropertyChange($event: string | undefined) {
    const key = $event as SystemPropertyKey;
    this.setSystemPropertyType(
      this.systemPropertyHelpers.toFilterPropertyType(key),
    );
  }

  private setSystemPropertyType(
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
}
