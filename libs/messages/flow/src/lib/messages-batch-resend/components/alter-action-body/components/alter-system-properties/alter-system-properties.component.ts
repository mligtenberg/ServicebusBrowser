import { Component, computed, effect, inject, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlterAction,
  AlterSystemPropertyActions,
  AlterType,
  PropertyValue,
  SystemKeyProperty
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { SystemPropertyHelpers } from '../../../../../systemproperty-helpers';
import { SystemPropertyKeys } from '../../../../../send-message/form';

@Component({
  selector: 'lib-alter-system-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputGroup,
    InputText,
    Select,
    DatePicker,
    Popover,
    DurationInputComponent
  ],
  templateUrl: './alter-system-properties.component.html',
  styleUrls: ['./alter-system-properties.component.scss']
})
export class AlterSystemPropertiesComponent {
  alterActionUpdated = output<AlterAction | undefined>();
  systemPropertyHelpers = inject(SystemPropertyHelpers);

  protected alterType = model<AlterType>('fullReplace');
  protected fieldName = model<SystemKeyProperty | ''>('');
  protected value = model<PropertyValue | undefined>();
  protected searchValue = model<string>('');

  systemPropertyKeys = SystemPropertyKeys;

  alterTypes = [
    { label: 'Full Replace', value: 'fullReplace' },
    { label: 'Search and Replace', value: 'searchAndReplace' },
    { label: 'Regex Replace', value: 'regexReplace' }
  ];

  alterAction = computed<AlterSystemPropertyActions | undefined>(() => {
    const currentAlterType = this.alterType();
    const currentFieldName = this.fieldName();
    const currentValue = this.value();

    if (!currentFieldName|| !currentValue) {
      return undefined;
    }

    if (currentAlterType === 'fullReplace') {
      return {
        type: 'alter',
        target: 'systemProperties',
        fieldName: currentFieldName as SystemKeyProperty,
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
        target: 'systemProperties',
        fieldName: currentFieldName as SystemKeyProperty,
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

  propertyUnknownType(key: SystemKeyProperty | '') {
    return (
      !this.systemPropertyIsText(key) &&
      !this.systemPropertyIsDate(key) &&
      !this.systemPropertyIsTimeSpan(key)
    );
  }

  systemPropertyIsText(key: SystemKeyProperty | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsText(key);
  }

  systemPropertyIsDate(key: SystemKeyProperty | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsDate(key);
  }

  systemPropertyIsTimeSpan(key: SystemKeyProperty | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsTimeSpan(key);
  }
}
