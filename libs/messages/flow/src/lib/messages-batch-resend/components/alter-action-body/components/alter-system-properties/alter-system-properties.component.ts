import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';

import { PropertyValue } from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import {
  AmqpPropertyKeys,
  AmqpPropertyKeys as AmqpPropertyKeysList,
} from '../../../../../send-message/form';
import { Tooltip } from 'primeng/tooltip';
import {
  AlterAction,
  AlterPropertyActions,
  AlterPropertyPartialReplaceAction,
  AlterType,
  MessageModificationAction,
} from '@service-bus-browser/message-modification-engine';

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
    Tooltip,
  ],
  templateUrl: './alter-system-properties.component.html',
  styleUrls: ['./alter-system-properties.component.scss'],
})
export class AlterSystemPropertiesComponent {
  alterActionUpdated = output<AlterAction | undefined>();

  action = input<MessageModificationAction>();
  protected alterType = model<AlterType>('fullReplace');
  protected fieldName = model<AmqpPropertyKeys | ''>('');
  protected value = model<PropertyValue | undefined>();
  protected searchValue = model<string>('');

  propertyKeys = AmqpPropertyKeysList;

  alterTypes = computed(() => {
    const currentFieldIsString = this.propertyIsText(this.fieldName());
    if (!currentFieldIsString) {
      return [{ label: 'Full Replace', value: 'fullReplace' }];
    }

    return [
      { label: 'Full Replace', value: 'fullReplace' },
      { label: 'Search and Replace', value: 'searchAndReplace' },
      { label: 'Regex Replace', value: 'regexReplace' },
    ];
  });

  alterAction = computed<AlterPropertyActions | undefined>(() => {
    const currentAlterType = this.alterType();
    const currentFieldName = this.fieldName();
    const currentValue = this.value();

    if (!currentFieldName || !currentValue) {
      return undefined;
    }

    if (currentAlterType === 'fullReplace') {
      return {
        type: 'alter',
        target: 'properties',
        fieldName: currentFieldName as AmqpPropertyKeys,
        value: currentValue,
        alterType: 'fullReplace',
        applyOnFilter: {
          body: [],
          headers: [],
          properties: [],
          deliveryAnnotations: [],
          messageAnnotations: [],
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
        target: 'properties',
        fieldName: currentFieldName as AmqpPropertyKeys,
        searchValue: currentSearchValue,
        value: currentValue as string,
        alterType: currentAlterType,
        applyOnFilter: {
          body: [],
          headers: [],
          properties: [],
          deliveryAnnotations: [],
          messageAnnotations: [],
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
      const action = this.action() as Partial<AlterPropertyActions> | undefined;
      if (!action) {
        return;
      }

      const partialReplaceAction =
        action as Partial<AlterPropertyPartialReplaceAction>;

      if (action.fieldName) {
        this.fieldName.set(action.fieldName as AmqpPropertyKeys);
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

  propertyUnknownType(key: AmqpPropertyKeys | '') {
    return (
      !this.propertyIsText(key) &&
      !this.propertyIsDate(key) &&
      !this.propertyIsTimeSpan(key) &&
      !this.propertyIsNumber(key)
    );
  }

  propertyIsText(key: AmqpPropertyKeys | '') {
    if (key === '') {
      return false;
    }

    return (
      key === 'message-id' ||
      key === 'user-id' ||
      key === 'to' ||
      key === 'subject' ||
      key === 'reply-to' ||
      key === 'correlation-id' ||
      key === 'content-type' ||
      key === 'content-encoding' ||
      key === 'group-id' ||
      key === 'reply-to-group-id'
    );
  }

  propertyIsDate(key: AmqpPropertyKeys | '') {
    if (key === '') {
      return false;
    }

    return key === 'absolute-expiry-time' || key === 'creation-time';
  }

  propertyIsTimeSpan(key: AmqpPropertyKeys | '') {
    if (key === '') {
      return false;
    }

    return false;
  }

  propertyIsNumber(key: AmqpPropertyKeys | '') {
    if (key === '') {
      return false;
    }

    return key === 'group-sequence';
  }
}
