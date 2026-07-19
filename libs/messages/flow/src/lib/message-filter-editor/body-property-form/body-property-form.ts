import { Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  SbbButton,
  SbbCheckbox,
  SbbInput,
  SbbInputGroup,
  SbbInputGroupAddon,
} from '@service-bus-browser/shared-ui';
import { SelectSignalFormInput } from '../../form/select-signal-form-input/select-signal-form-input';
import { bodyFilterTypes } from '../options';
import {
  disabled as formDisabled,
  FieldTree,
  form,
  FormField,
  FormValueControl,
  required,
} from '@angular/forms/signals';
import { BodyFilter } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-body-property-form',
  imports: [
    SbbButton,
    SbbCheckbox,
    SbbInputGroup,
    SbbInputGroupAddon,
    SbbInput,
    SelectSignalFormInput,
    FormField,
  ],
  templateUrl: './body-property-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  protected readonly removeIcon = faTrash;

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
