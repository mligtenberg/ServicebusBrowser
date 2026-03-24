import { Component, computed, effect, input, model } from '@angular/core';

import {
  MessageModificationAction,
  BatchActionTarget,
  BatchActionType,
} from '@service-bus-browser/message-modification-engine';
import { InputGroup } from 'primeng/inputgroup';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AddActionBodyComponent } from '../add-action-body/add-action-body.component';
import { AlterActionBodyComponent } from '../alter-action-body/alter-action-body.component';
import { RemoveActionBodyComponent } from '../remove-action-body/remove-action-body.component';
import {
  hasActiveFilters,
  MessageFilter,
} from '@service-bus-browser/filtering';
import { MessageFilterEditorComponent } from '../../../message-filter-editor/message-filter-editor.component';

@Component({
  selector: 'lib-action',
  imports: [
    InputGroup,
    Select,
    Button,
    FormsModule,
    AddActionBodyComponent,
    AlterActionBodyComponent,
    RemoveActionBodyComponent,
    MessageFilterEditorComponent,
  ],
  templateUrl: './action.component.html',
  styleUrl: './action.component.scss',
})
export class ActionComponent {
  actionTypes = [
    { label: 'Add', value: 'add' },
    { label: 'Alter', value: 'alter' },
    { label: 'Remove', value: 'remove' },
  ];

  addTargets = [
    { label: 'Properties', value: 'properties' },
    { label: 'Application Properties', value: 'applicationProperties' },
  ];

  alterTargets = [
    { label: 'Body', value: 'body' },
    { label: 'Properties', value: 'properties' },
    { label: 'Application Properties', value: 'applicationProperties' },
  ];

  removeTargets = [
    { label: 'Properties', value: 'properties' },
    { label: 'Application Properties', value: 'applicationProperties' },
  ];

  targets = computed(() => {
    switch (this.currentActionType()) {
      case 'add':
        return this.addTargets;
      case 'alter':
        return this.alterTargets;
      case 'remove':
        return this.removeTargets;
      default:
        return [];
    }
  });

  applicationPropertyLabels = input<string[]>([]);
  currentActionType = model<BatchActionType>();
  target = model<BatchActionTarget>();
  action = model<MessageModificationAction>();
  protected filterMenuVisable = model<boolean>(false);
  protected messageFilter = model<MessageFilter>({
    body: [],
    headers: [],
    properties: [],
    deliveryAnnotations: [],
    messageAnnotations: [],
    applicationProperties: [],
  });

  clear() {
    this.currentActionType.set(undefined);
    this.target.set(undefined);
    this.messageFilter.set({
      body: [],
      headers: [],
      properties: [],
      deliveryAnnotations: [],
      messageAnnotations: [],
      applicationProperties: [],
    });
  }

  isFilterActive = computed(() => hasActiveFilters(this.messageFilter()));

  constructor() {
    effect(() => {
      if (!this.targets().some((t) => t.value === this.target())) {
        this.target.set(undefined);
      }
    });

    effect(() => {
      const action = this.action() as
        | Partial<MessageModificationAction>
        | undefined;

      if (!action) {
        return;
      }

      this.currentActionType.set(action.type);
      this.target.set(action.target);
      this.messageFilter.set(
        action.applyOnFilter ?? {
          body: [],
          applicationProperties: [],
          headers: [],
          properties: [],
          deliveryAnnotations: [],
          messageAnnotations: [],
        },
      );
    });
  }

  protected readonly queueMicrotask = queueMicrotask;
}
