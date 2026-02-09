import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePickerSignalFormInput } from '../date-picker-signal-form-input/date-picker-signal-form-input';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { SelectSignalFormInput } from '../select-signal-form-input/select-signal-form-input';

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
    SelectSignalFormInput
  ],
  templateUrl: './system-property-form.html',
  styleUrl: './system-property-form.scss',
})
export class SystemPropertyForm {}
