import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  SbbButton,
  SbbCheckbox,
  SbbInput,
  SbbInputGroup,
  SbbInputGroupAddon,
  SbbInputNumber,
  SbbPopover,
} from '@service-bus-browser/shared-ui';
import { DatePickerSignalFormInput } from '../../form/date-picker-signal-form-input/date-picker-signal-form-input';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { SelectSignalFormInput } from '../../form/select-signal-form-input/select-signal-form-input';
import { FieldTree, form, FormField, FormValueControl, required, disabled as formDisabled } from '@angular/forms/signals';
import {
  dateFilterTypes,
  numberFilterTypes,
  stringFilterTypes,
  timespanFilterTypes,
} from '../options';
import { PropertyFilter } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-system-property-form',
  imports: [
    SbbButton,
    SbbCheckbox,
    DatePickerSignalFormInput,
    DurationInputComponent,
    SbbInputGroup,
    SbbInputGroupAddon,
    SbbInput,
    SbbInputNumber,
    SbbPopover,
    SelectSignalFormInput,
    FormField,
    FormsModule,
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

  availableSystemProperties = input.required<{
    label: string;
    type: string;
  }[]>();

  stringFilterTypes = stringFilterTypes;
  dateFilterTypes = dateFilterTypes;
  numberFilterTypes = numberFilterTypes;
  timespanFilterTypes = timespanFilterTypes;
  systemPropertyOptions = computed(() => {
    return this.availableSystemProperties().map((prop) => {
      return {
        label: prop.label,
        value: prop.label,
      }
    });
  });

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

  protected readonly removeIcon = faTrash;

  protected remove() {
    this.removedPressed.emit();
  }

  protected togglePopover(popover: SbbPopover, $event: Event) {
    popover.toggle($event.currentTarget as HTMLElement);
  }

  protected onSystemPropertyChange($event: string | undefined) {
    const availableSystemProperties = this.availableSystemProperties();
    const item = availableSystemProperties.find(
      (option) => option.label === $event,
    );
    this.setSystemPropertyType(
      (item?.type as 'string' | 'date' | 'number' | 'boolean' | 'timespan' | undefined) ?? 'string',
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
