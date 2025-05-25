import { Component, computed, effect, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlterAction,
  AlterApplicationPropertyActions,
  AlterType,
  PropertyValue
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'lib-alter-application-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputGroup,
    InputText,
    Select,
    DatePicker
  ],
  templateUrl: './alter-application-properties.component.html',
  styleUrls: ['./alter-application-properties.component.scss']
})
export class AlterApplicationPropertiesComponent {
  alterActionUpdated = output<AlterAction | undefined>();

  protected alterType = model<AlterType>('fullReplace');
  protected fieldName = model<string>('');
  protected value = model<PropertyValue | undefined>();
  protected searchValue = model<string>('');
  protected propertyType = model<string>('string');

  typeOptions = ['string', 'datetime', 'number', 'boolean'];

  alterTypes = [
    { label: 'Full Replace', value: 'fullReplace' },
    { label: 'Search and Replace', value: 'searchAndReplace' },
    { label: 'Regex Replace', value: 'regexReplace' }
  ];

  alterAction = computed<AlterApplicationPropertyActions | undefined>(() => {
    const currentAlterType = this.alterType();
    const currentFieldName = this.fieldName();
    const currentValue = this.value();

    if (!currentFieldName || currentFieldName === '' || !currentValue) {
      return undefined;
    }

    if (currentAlterType === 'fullReplace') {
      return {
        type: 'alter',
        target: 'applicationProperties',
        fieldName: currentFieldName,
        value: currentValue,
        alterType: 'fullReplace',
        applyOnFilter: { body: [], systemProperties: [], applicationProperties: [] }
      };
    } else {
      const currentSearchValue = this.searchValue();

      if (!currentSearchValue || currentSearchValue === '') {
        return undefined;
      }

      return {
        type: 'alter',
        target: 'applicationProperties',
        fieldName: currentFieldName,
        searchValue: currentSearchValue,
        value: currentValue as string,
        alterType: currentAlterType,
        applyOnFilter: { body: [], systemProperties: [], applicationProperties: [] }
      };
    }
  });

  constructor() {
    effect(() => {
      this.alterActionUpdated.emit(this.alterAction());
    });
  }
}
