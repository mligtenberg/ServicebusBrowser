import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { SelectSignalFormInput } from '../../form/select-signal-form-input/select-signal-form-input';
import { bodyFilterTypes } from '../options';
import {
  disabled as formDisabled,
  DisabledReason,
  FieldTree,
  form,
  FormField,
  FormValueControl,
  required,
  ValidationError,
  WithOptionalField,
} from '@angular/forms/signals';
import {
  BodyFilter,
  PropertyFilter,
} from '@service-bus-browser/messages-contracts';

@Component({
  selector: 'lib-body-property-form',
  imports: [
    Button,
    Checkbox,
    InputGroup,
    InputGroupAddon,
    InputText,
    SelectSignalFormInput,
    FormField,
  ],
  templateUrl: './body-property-form.html',
  styleUrl: './body-property-form.scss',
})
export class BodyPropertyForm implements FormValueControl<BodyFilter> {
  value = model<BodyFilter>({
    isActive: true,
    filterType: 'equals',
    value: '',
  });

  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  touched = model<boolean>(false);
  required = input<boolean>(false);
  removable = input<boolean>(false);
  removedPressed = output<void>();

  protected readonly bodyFilterTypes = bodyFilterTypes;

  bodyForm = form(this.value, (v) => {
    required(v.filterType);

    if (this.disabled()) {
      formDisabled(v);
    }
  });

  protected asStringValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<string, string> {
    return value as FieldTree<string, string>;
  }

  protected removeBody() {
    this.removedPressed.emit();
  }
}
