import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';

import {
  MessageModificationAction,
  AddAction,
  BatchActionTarget,
} from '@service-bus-browser/message-modification-engine';
import { SystemPropertyKeys } from '../../../send-message/form';
import { DatePicker } from 'primeng/datepicker';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Select } from 'primeng/select';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SystemPropertyHelpers } from '../../../systemproperty-helpers';
import { Checkbox } from 'primeng/checkbox';
import { MessageFilter } from '@service-bus-browser/filtering';
import { PropertyValue } from '@service-bus-browser/api-contracts';
import { SystemPropertyKey } from '@service-bus-browser/messages-contracts';

@Component({
  selector: 'lib-add-action-body',
  imports: [
    AutoComplete,
    DatePicker,
    DurationInputComponent,
    FormsModule,
    InputGroup,
    InputText,
    Popover,
    Select,
    ReactiveFormsModule,
    Checkbox
],
  templateUrl: './add-action-body.component.html',
  styleUrl: './add-action-body.component.scss',
})
export class AddActionBodyComponent {
  target = input.required<Exclude<BatchActionTarget, 'body'>>();
  messageFilter = input.required<MessageFilter>();
  applicationPropertyLabels = input<string[]>([]);
  addActionUpdated = output<AddAction | undefined>();
  systemPropertyHelpers = inject(SystemPropertyHelpers);

  action = input<MessageModificationAction>();

  protected applicationPropertyName = model<string>('');
  protected systemPropertyName = model<SystemPropertyKeys | ''>('');
  protected replaceOnDuplicate = model<boolean>(false);
  protected value = model<PropertyValue | undefined>();

  systemPropertyKeys = SystemPropertyKeys;
  typeOptions = ['string', 'datetime', 'number', 'boolean'];
  protected filteredLabels = signal<string[]>([]);

  filterLabels(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredLabels.set(
      this.applicationPropertyLabels().filter((l) =>
        l.toLowerCase().includes(query),
      ),
    );
  }

  addAction = computed<AddAction | undefined>(() => {
    const target = this.target();
    const fieldName =
      this.target() === 'applicationProperties'
        ? this.applicationPropertyName()
        : this.systemPropertyName();

    const currentValue = this.value();

    if (!fieldName || fieldName === '' || !currentValue) {
      return undefined;
    }

    if (target === 'systemProperties') {
      return {
        type: 'add',
        target: 'systemProperties',
        actionOnDuplicate: this.replaceOnDuplicate() ? 'replace' : 'skip',
        fieldName: fieldName as SystemPropertyKeys,
        value: currentValue,
        applyOnFilter: this.messageFilter(),
      };
    }

    return {
      type: 'add',
      target: 'applicationProperties',
      actionOnDuplicate: this.replaceOnDuplicate() ? 'replace' : 'skip',
      fieldName: fieldName,
      value: currentValue,
      applyOnFilter: this.messageFilter(),
    };
  });

  constructor() {
    effect(() => {
      this.addActionUpdated.emit(this.addAction());
    });

    effect(() => {
      this.target();
      this.applicationPropertyName.set('');
      this.systemPropertyName.set('');
    });

    effect(() => {
      this.applicationPropertyName();
      this.systemPropertyName();

      this.value.set(undefined);
    });

    effect(() => {
      const addAction = this.action() as Partial<AddAction> | undefined;
      if (!addAction) {
        return;
      }

      if (addAction.fieldName && this.target() === 'systemProperties') {
        this.systemPropertyName.set(addAction.fieldName as SystemPropertyKeys);
      }
      if (addAction.fieldName && this.target() === 'applicationProperties') {
        this.applicationPropertyName.set(addAction.fieldName);
      }

      if (addAction.value) {
        this.value.set(addAction.value);
      }

      this.replaceOnDuplicate.set(addAction.actionOnDuplicate === 'replace');
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

  protected readonly console = console;
}
