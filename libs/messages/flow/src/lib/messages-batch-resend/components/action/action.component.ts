import { Component, computed, effect, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Action,
  BatchActionTarget,
  BatchActionType,
  MessageFilter,
} from '@service-bus-browser/messages-contracts';
import { InputGroup } from 'primeng/inputgroup';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AddActionBodyComponent } from '../add-action-body/add-action-body.component';
import { AlterActionBodyComponent } from '../alter-action-body/alter-action-body.component';
import { RemoveActionBodyComponent } from '../remove-action-body/remove-action-body.component';
import { MessageFilterDialogComponent } from '../../../message-filter-dialog/message-filter-dialog.component';
import { hasActiveFilters } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-action',
  imports: [
    CommonModule,
    InputGroup,
    Select,
    Button,
    FormsModule,
    AddActionBodyComponent,
    AlterActionBodyComponent,
    RemoveActionBodyComponent,
    MessageFilterDialogComponent,
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
    { label: 'System Properties', value: 'systemProperties' },
    { label: 'Application Properties', value: 'applicationProperties' },
  ];

  alterTargets = [
    { label: 'Body', value: 'body' },
    { label: 'System Properties', value: 'systemProperties' },
    { label: 'Application Properties', value: 'applicationProperties' },
  ];

  removeTargets = [
    { label: 'System Properties', value: 'systemProperties' },
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

  currentActionType = model<BatchActionType>();
  target = model<BatchActionTarget>();
  action = model<Action>();
  protected filterMenuVisable = model<boolean>(false);
  protected messageFilter = model<MessageFilter>({
    body: [],
    systemProperties: [],
    applicationProperties: []
  });

  clear() {
    this.currentActionType.set(undefined);
    this.target.set(undefined);
    this.messageFilter.set({
      body: [],
      systemProperties: [],
      applicationProperties: []
    })
  }

  isFilterActive = computed(() => hasActiveFilters(this.messageFilter()));

  constructor() {
    effect(() => {
      if (!this.targets().some((t) => t.value === this.target())) {
        this.target.set(undefined);
      }
    });

    effect(() => {
      const action = this.action() as Partial<Action> | undefined;

      if (!action) {
        return;
      }

      this.currentActionType.set(action.type);
      this.target.set(action.target);
      this.messageFilter.set(action.applyOnFilter ?? {
        body: [],
        applicationProperties: [],
        systemProperties: []
      });
    });
  }

  protected readonly queueMicrotask = queueMicrotask;
}
