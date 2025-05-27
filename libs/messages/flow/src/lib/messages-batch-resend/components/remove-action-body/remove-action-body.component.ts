import { Component, computed, effect, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Action,
  BatchActionTarget,
  MessageFilter,
  RemoveAction,
  SystemKeyProperty
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SystemPropertyKeys } from '../../../send-message/form';

@Component({
  selector: 'lib-remove-action-body',
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
  ],
  templateUrl: './remove-action-body.component.html',
  styleUrl: './remove-action-body.component.scss',
})
export class RemoveActionBodyComponent {
  action = input<Action>();
  target = input.required<Exclude<BatchActionTarget, 'body'>>();
  messageFilter = input.required<MessageFilter>();
  removeActionUpdated = output<RemoveAction | undefined>();

  protected applicationPropertyName = model<string>('');
  protected systemPropertyName = model<SystemKeyProperty | ''>('');

  systemPropertyKeys = SystemPropertyKeys;

  removeAction = computed<RemoveAction | undefined>(() => {
    const target = this.target();
    const fieldName =
      this.target() === 'applicationProperties'
        ? this.applicationPropertyName()
        : this.systemPropertyName();

    if (!fieldName || fieldName === '') {
      return undefined;
    }

    if (target === 'systemProperties') {
      return {
        type: 'remove',
        target: 'systemProperties',
        fieldName: fieldName as SystemKeyProperty,
        applyOnFilter: this.messageFilter(),
      };
    }

    return {
      type: 'remove',
      target: 'applicationProperties',
      fieldName: fieldName,
      applyOnFilter: this.messageFilter(),
    };
  });

  constructor() {
    effect(() => {
      this.removeActionUpdated.emit(this.removeAction());
    });

    effect(() => {
      this.target();
      this.applicationPropertyName.set('');
      this.systemPropertyName.set('');
    });

    effect(() => {
      const action = this.action() as Partial<RemoveAction> | undefined;

      if (action?.fieldName && this.target() === 'systemProperties') {
        this.systemPropertyName.set(action.fieldName as SystemKeyProperty);
      }

      if (action?.fieldName && this.target() === 'applicationProperties') {
        this.applicationPropertyName.set(action.fieldName);
      }
    });
  }
}
