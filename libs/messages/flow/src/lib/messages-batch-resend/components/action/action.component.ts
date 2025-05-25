import { Component, computed, effect, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Action,
  AddAction,
  AlterAction,
  BatchActionTarget,
  BatchActionType, 
  MessageFilter,
  RemoveAction
} from '@service-bus-browser/messages-contracts';
import { Card } from 'primeng/card';
import { InputGroup } from 'primeng/inputgroup';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AddActionBodyComponent } from '../add-action-body/add-action-body.component';
import { AlterActionBodyComponent } from '../alter-action-body/alter-action-body.component';
import { RemoveActionBodyComponent } from '../remove-action-body/remove-action-body.component';
import { MessageFilterDialogComponent } from '../../../message-filter-dialog/message-filter-dialog.component';
import { MessageFilterService } from '../../../message-filter/message-filter.service';

@Component({
  selector: 'lib-action',
  imports: [
    CommonModule,
    Card,
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

  messageFilterService = inject(MessageFilterService);
  
  currentActionType = model<BatchActionType>();
  target = model<BatchActionTarget>();
  addAction = model<AddAction>();
  alterAction = model<AlterAction>();
  removeAction = model<RemoveAction>();
  protected filterMenuVisable = model<boolean>(false);
  protected messageFilter = model<MessageFilter>({
    body: [],
    systemProperties: [],
    applicationProperties: []
  });
  
  isFilterActive = computed(() => this.messageFilterService.hasActiveFilters(this.messageFilter()));

  constructor() {
    effect(() => {
      if (!this.targets().some((t) => t.value === this.target())) {
        this.target.set(undefined);
      }
    });
  }
}
