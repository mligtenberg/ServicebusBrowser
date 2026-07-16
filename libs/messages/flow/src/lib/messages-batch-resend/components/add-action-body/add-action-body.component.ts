import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';

import {
  MessageModificationAction,
  AddAction,
  BatchActionTarget,
} from '@service-bus-browser/message-modification-engine';
import {
  AmqpPropertyKeys,
  AmqpPropertyKeys as AmqpPropertyKeysList,
} from '../../../send-message/form';
import {
  SbbAutocomplete,
  SbbCheckbox,
  SbbDatePicker,
  SbbInput,
  SbbInputGroup,
  SbbInputNumber,
  SbbPopover,
  SbbSelect,
} from '@service-bus-browser/shared-ui';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SystemPropertyHelpers } from '../../../systemproperty-helpers';
import { MessageFilter } from '@service-bus-browser/filtering';
import { PropertyValue } from '@service-bus-browser/api-contracts';

@Component({
  selector: 'lib-add-action-body',
  imports: [
    SbbAutocomplete,
    SbbDatePicker,
    DurationInputComponent,
    FormsModule,
    SbbInputGroup,
    SbbInput,
    SbbInputNumber,
    SbbPopover,
    SbbSelect,
    ReactiveFormsModule,
    SbbCheckbox,
  ],
  templateUrl: './add-action-body.component.html',
  styleUrl: './add-action-body.component.scss',
})
export class AddActionBodyComponent {
  target = input.required<Exclude<BatchActionTarget, 'body'>>();
  messageFilter = input.required<MessageFilter>();
  applicationPropertyLabels = input<string[]>([]);
  addActionUpdated = output<AddAction | undefined>();

  action = input<MessageModificationAction>();

  protected applicationPropertyName = model<string>('');
  protected propertyName = model<AmqpPropertyKeys | ''>('');
  protected replaceOnDuplicate = model<boolean>(false);
  protected value = model<PropertyValue | undefined>();
  // Tracks the custom application-property value type. Previously read off a
  // p-select's own `#ref.value` template variable; SbbSelect keeps no
  // such public value property, so this is now bound via [(ngModel)] instead.
  protected applicationPropertyType = signal<string>('string');

  propertyKeys = AmqpPropertyKeysList.map((key) => ({ label: key, value: key }));
  typeOptions = ['string', 'datetime', 'number', 'boolean'].map((type) => ({
    label: type,
    value: type,
  }));
  protected filteredLabels = signal<string[]>([]);

  filterLabels(query: string) {
    const lowered = query.toLowerCase();
    this.filteredLabels.set(
      this.applicationPropertyLabels().filter((l) =>
        l.toLowerCase().includes(lowered),
      ),
    );
  }

  protected togglePopover(popover: SbbPopover, $event: Event) {
    popover.toggle($event.currentTarget as HTMLElement);
  }

  addAction = computed<AddAction | undefined>(() => {
    const target = this.target();
    const fieldName =
      this.target() === 'applicationProperties'
        ? this.applicationPropertyName()
        : this.propertyName();

    const currentValue = this.value();

    if (!fieldName || fieldName === '' || !currentValue) {
      return undefined;
    }

    if (target === 'properties') {
      return {
        type: 'add',
        target: 'properties',
        actionOnDuplicate: this.replaceOnDuplicate() ? 'replace' : 'skip',
        fieldName: fieldName as AmqpPropertyKeys,
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
      this.propertyName.set('');
    });

    effect(() => {
      this.applicationPropertyName();
      this.propertyName();

      this.value.set(undefined);
    });

    effect(() => {
      const addAction = this.action() as Partial<AddAction> | undefined;
      if (!addAction) {
        return;
      }

      if (addAction.fieldName && this.target() === 'properties') {
        this.propertyName.set(addAction.fieldName as AmqpPropertyKeys);
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

  protected readonly console = console;
}
