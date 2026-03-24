import { Component, computed, effect, input, model, output, signal } from '@angular/core';

import {
  AmqpPropertyKeys,
  AmqpPropertyKeys as AmqpPropertyKeysList,
} from '../../../send-message/form';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {
  BatchActionTarget,
  MessageModificationAction,
  RemoveAction,
} from '@service-bus-browser/message-modification-engine';
import { MessageFilter } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-remove-action-body',
  imports: [AutoComplete, FormsModule, Select],
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
  protected propertyName = model<AmqpPropertyKeys | ''>('');
  protected filteredLabels = signal<string[]>([]);

  propertyKeys = AmqpPropertyKeysList;

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
        : this.propertyName();

    if (!fieldName || fieldName === '') {
      return undefined;
    }

    if (target === 'properties') {
      return {
        type: 'remove',
        target: 'properties',
        fieldName: fieldName as AmqpPropertyKeys,
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
      this.propertyName.set('');
    });

    effect(() => {
      const action = this.action() as Partial<RemoveAction> | undefined;

      if (action?.fieldName && this.target() === 'properties') {
        this.propertyName.set(action.fieldName as AmqpPropertyKeys);
      }

      if (action?.fieldName && this.target() === 'applicationProperties') {
        this.applicationPropertyName.set(action.fieldName);
      }
    });
  }
}
