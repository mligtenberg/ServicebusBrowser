import { Component, computed, effect, inject, input, model, output } from '@angular/core';

import {
  Action,
  AlterAction,
  AlterSystemPropertyActions, AlterSystemPropertyPartialReplaceAction,
  AlterType,
  PropertyValue,
  SystemPropertyKey
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
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'lib-alter-system-properties',
  standalone: true,
  imports: [
    FormsModule,
    InputGroup,
    InputText,
    Select,
    DatePicker,
    Popover,
    DurationInputComponent,
    Tooltip
],
  templateUrl: './alter-system-properties.component.html',
  styleUrls: ['./alter-system-properties.component.scss'],
})
export class AlterSystemPropertiesComponent {
  alterActionUpdated = output<AlterAction | undefined>();
  systemPropertyHelpers = inject(SystemPropertyHelpers);

  action = input<Action>();
  protected alterType = model<AlterType>('fullReplace');
  protected fieldName = model<SystemPropertyKey | ''>('');
  protected value = model<PropertyValue | undefined>();
  protected searchValue = model<string>('');

  systemPropertyKeys = SystemPropertyKeys;

  alterTypes = computed(() => {
    const currentFieldIsString = this.systemPropertyIsText(this.fieldName());
    if (!currentFieldIsString) {
      return [
        { label: 'Full Replace', value: 'fullReplace' },
      ];
    }

    return [
      { label: 'Full Replace', value: 'fullReplace' },
      { label: 'Search and Replace', value: 'searchAndReplace' },
      { label: 'Regex Replace', value: 'regexReplace' },
    ]
  });

  alterAction = computed<AlterSystemPropertyActions | undefined>(() => {
    const currentAlterType = this.alterType();
    const currentFieldName = this.fieldName();
    const currentValue = this.value();

    if (!currentFieldName || !currentValue) {
      return undefined;
    }

    if (currentAlterType === 'fullReplace') {
      return {
        type: 'alter',
        target: 'systemProperties',
        fieldName: currentFieldName as SystemPropertyKey,
        value: currentValue,
        alterType: 'fullReplace',
        applyOnFilter: {
          body: [],
          systemProperties: [],
          applicationProperties: [],
        },
      };
    } else {
      const currentSearchValue = this.searchValue();

      if (!currentSearchValue || currentSearchValue === '') {
        return undefined;
      }

      return {
        type: 'alter',
        target: 'systemProperties',
        fieldName: currentFieldName as SystemPropertyKey,
        searchValue: currentSearchValue,
        value: currentValue as string,
        alterType: currentAlterType,
        applyOnFilter: {
          body: [],
          systemProperties: [],
          applicationProperties: [],
        },
      };
    }
  });

  constructor() {
    effect(() => {
      this.alterActionUpdated.emit(this.alterAction());
    });

    effect(() => {
      const action = this.action() as
        | Partial<AlterSystemPropertyActions>
        | undefined;
      if (!action) {
        return;
      }

      const partialReplaceAction =
        action as Partial<AlterSystemPropertyPartialReplaceAction>;

      if (action.fieldName) {
        this.fieldName.set(action.fieldName);
      }

      if (action.value) {
        this.value.set(action.value);
      }

      if (partialReplaceAction.searchValue) {
        this.searchValue.set(partialReplaceAction.searchValue);
      }

      if (action.alterType) {
        this.alterType.set(action.alterType);
      }
    });
  }

  propertyUnknownType(key: SystemPropertyKey | '') {
    return (
      !this.systemPropertyIsText(key) &&
      !this.systemPropertyIsDate(key) &&
      !this.systemPropertyIsTimeSpan(key)
    );
  }

  systemPropertyIsText(key: SystemPropertyKey | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsText(key);
  }

  systemPropertyIsDate(key: SystemPropertyKey | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsDate(key);
  }

  systemPropertyIsTimeSpan(key: SystemPropertyKey | '') {
    if (key === '') {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsTimeSpan(key);
  }
}
