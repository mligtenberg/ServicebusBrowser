import { Component, computed, effect, input, model, output, signal } from '@angular/core';

import {
  SystemPropertyKey
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SystemPropertyKeys } from '../../../send-message/form';
import {
  BatchActionTarget,
  MessageModificationAction,
  RemoveAction,
} from '@service-bus-browser/message-modification-engine';
import { MessageFilter } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-remove-action-body',
  imports: [
    AutoComplete,
    FormsModule,
    InputText,
    Select
],
  templateUrl: './remove-action-body.component.html',
  styleUrl: './remove-action-body.component.scss',
})
export class RemoveActionBodyComponent {
  action = input<MessageModificationAction>();
  target = input.required<Exclude<BatchActionTarget, 'body'>>();
  messageFilter = input.required<MessageFilter>();
  applicationPropertyLabels = input<string[]>([]);
  removeActionUpdated = output<RemoveAction | undefined>();

  protected applicationPropertyName = model<string>('');
  protected systemPropertyName = model<SystemPropertyKey | ''>('');
  protected filteredLabels = signal<string[]>([]);

  systemPropertyKeys = SystemPropertyKeys;

  filterLabels(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredLabels.set(
      this.applicationPropertyLabels().filter((l) =>
        l.toLowerCase().includes(query),
      ),
    );
  }

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
        fieldName: fieldName as SystemPropertyKey,
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
        this.systemPropertyName.set(action.fieldName as SystemPropertyKey);
      }

      if (action?.fieldName && this.target() === 'applicationProperties') {
        this.applicationPropertyName.set(action.fieldName);
      }
    });
  }
}
