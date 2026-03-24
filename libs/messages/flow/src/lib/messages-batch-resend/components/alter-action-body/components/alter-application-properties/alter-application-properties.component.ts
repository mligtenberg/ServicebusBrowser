import { Component, computed, effect, input, model, output, signal } from '@angular/core';

import {
  MessageModificationAction,
  AlterAction,
  AlterApplicationPropertyActions,
  AlterApplicationPropertyPartialReplaceAction,
  AlterType,
} from '@service-bus-browser/message-modification-engine';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { PropertyValue } from '@service-bus-browser/api-contracts';

@Component({
  selector: 'lib-alter-application-properties',
  standalone: true,
  imports: [
    AutoComplete,
    FormsModule,
    InputGroup,
    InputText,
    Select,
    DatePicker,
    Tooltip
],
  templateUrl: './alter-application-properties.component.html',
  styleUrls: ['./alter-application-properties.component.scss'],
})
export class AlterApplicationPropertiesComponent {
  alterActionUpdated = output<AlterAction | undefined>();

  action = input<MessageModificationAction>();
  applicationPropertyLabels = input<string[]>([]);
  protected alterType = model<AlterType>('fullReplace');
  protected fieldName = model<string>('');
  protected value = model<PropertyValue | undefined>();
  protected searchValue = model<string>('');
  protected propertyType = model<string>('string');
  protected filteredLabels = signal<string[]>([]);

  typeOptions = ['string', 'datetime', 'number', 'boolean'];

  filterLabels(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredLabels.set(
      this.applicationPropertyLabels().filter((l) =>
        l.toLowerCase().includes(query),
      ),
    );
  }

  alterTypes = computed(() => {
    const propertyType = this.propertyType();
    if (propertyType !== 'string') {
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
        target: 'applicationProperties',
        fieldName: currentFieldName,
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
        | Partial<AlterApplicationPropertyActions>
        | undefined;
      if (!action) {
        return;
      }
      const partialReplaceAction =
        action as Partial<AlterApplicationPropertyPartialReplaceAction>;

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

      if (typeof action.value === 'string') {
        this.propertyType.set('string');
      }
      if (typeof action.value === 'number') {
        this.propertyType.set('number');
      }
      if (typeof action.value === 'boolean') {
        this.propertyType.set('boolean');
      }
      if (typeof action.value === 'object') {
        this.propertyType.set('datetime');
      }
    });
  }
}
