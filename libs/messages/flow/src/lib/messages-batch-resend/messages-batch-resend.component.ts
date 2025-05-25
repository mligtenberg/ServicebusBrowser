import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Action,
  AddAction,
  AlterAction,
  BatchActionTarget,
  RemoveAction,
  ServiceBusMessage
} from '@service-bus-browser/messages-contracts';
import { BatchActionsService } from '../batch-actions/batch-actions.service';
import { ActionComponent } from './components/action/action.component';
import { Store } from '@ngrx/store';
import { MessagesSelectors, MessagesActions } from '@service-bus-browser/messages-store';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { Router } from '@angular/router';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';

@Component({
  selector: 'lib-messages-batch-resend',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionComponent,
    ButtonModule,
    ScrollPanelModule,
    DialogModule,
    DividerModule,
    ToastModule,
    EndpointSelectorInputComponent
  ],
  providers: [BatchActionsService, MessageService],
  templateUrl: './messages-batch-resend.component.html',
  styleUrl: './messages-batch-resend.component.scss',
})
export class MessagesBatchResendComponent {
  @ViewChild('actionEditor') actionEditor!: ActionComponent;

  private batchActionsService = inject(BatchActionsService);
  private store = inject(Store);
  private messageService = inject(MessageService);
  private router = inject(Router);

  protected actions = signal<Action[]>([]);
  protected previewDialogVisible = false;
  protected previewMessages: ServiceBusMessage[] = [];
  protected selectedEndpoint: SendEndpoint | null = null;

  private originalMessages: ServiceBusMessage[] = [];

  ngOnInit() {
    this.store.select(MessagesSelectors.selectBatchResendMessages)
      .pipe(take(1))
      .subscribe(messages => {
        if (messages && messages.length > 0) {
          this.originalMessages = [...messages];
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Messages',
            detail: 'No messages selected for batch resend'
          });
        }
      });
  }

  addAction() {
    let action: Action | undefined;

    if (this.actionEditor.currentActionType() === 'add' && this.actionEditor.addAction()) {
      action = this.actionEditor.addAction();
    } else if (this.actionEditor.currentActionType() === 'alter' && this.actionEditor.alterAction()) {
      action = this.actionEditor.alterAction();
    } else if (this.actionEditor.currentActionType() === 'remove' && this.actionEditor.removeAction()) {
      action = this.actionEditor.removeAction();
    }

    if (action) {
      this.actions.update(currentActions => [...currentActions, action!]);

      // Reset the action editor
      this.actionEditor.currentActionType.set(undefined as any);
      this.actionEditor.target.set(undefined as any);

      this.messageService.add({
        severity: 'success',
        summary: 'Action Added',
        detail: `${this.getActionTypeLabel(action.type)} action added successfully`
      });
    }
  }

  removeAction(index: number) {
    this.actions.update(currentActions => {
      const newActions = [...currentActions];
      newActions.splice(index, 1);
      return newActions;
    });
  }

  canAddAction(): boolean {
    if (!this.actionEditor) return false;

    if (this.actionEditor.currentActionType() === 'add') {
      return !!this.actionEditor.addAction();
    } else if (this.actionEditor.currentActionType() === 'alter') {
      return !!this.actionEditor.alterAction();
    } else if (this.actionEditor.currentActionType() === 'remove') {
      return !!this.actionEditor.removeAction();
    }

    return false;
  }

  previewChanges() {
    if (this.originalMessages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Messages',
        detail: 'No messages to preview changes'
      });
      return;
    }

    try {
      // Apply actions to original messages
      const modifiedMessages = this.batchActionsService.applyBatchActions(
        this.originalMessages,
        this.actions()
      );

      this.previewMessages = modifiedMessages ?
        modifiedMessages.slice(0, Math.min(5, modifiedMessages.length)) : [];
      this.previewDialogVisible = true;
    } catch (error) {
      console.error('Error applying batch actions:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to preview changes. Check the console for details.'
      });
    }
  }

  resendMessages() {
    if (this.originalMessages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Messages',
        detail: 'No messages to resend'
      });
      return;
    }

    if (!this.selectedEndpoint) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Endpoint',
        detail: 'Please select a destination endpoint for resending messages'
      });
      return;
    }

    try {
      // Apply actions to original messages
      const modifiedMessages = this.batchActionsService.applyBatchActions(
        this.originalMessages,
        this.actions()
      );

      if (modifiedMessages && modifiedMessages.length > 0) {
        this.store.dispatch(MessagesActions.sendMessages({
          endpoint: this.selectedEndpoint,
          messages: modifiedMessages
        }));

        this.messageService.add({
          severity: 'success',
          summary: 'Messages Sent',
          detail: `${modifiedMessages.length} messages have been queued for sending`
        });

        // Navigate back to messages page
        this.router.navigate(['/messages']);
      }
    } catch (error) {
      console.error('Error applying batch actions and sending messages:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send modified messages. Check the console for details.'
      });
    }
  }

  getActionTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'add': 'Add',
      'alter': 'Alter',
      'remove': 'Remove'
    };

    return typeMap[type] || type;
  }

  getActionTargetLabel(target: BatchActionTarget): string {
    const targetMap: Record<string, string> = {
      'body': 'Body',
      'systemProperties': 'System Properties',
      'applicationProperties': 'Application Properties'
    };

    return targetMap[target] || target;
  }

  getActionDescription(action: Action): string {
    switch (action.type) {
      case 'add':
        {
          const addAction = action as AddAction;
          return `Add ${addAction.fieldName} = ${this.formatValue(addAction.value)}`;
        }

      case 'alter':
        {
          const alterAction = action as AlterAction;
          if (alterAction.target === 'body') {
            return `Modify message body`;
          } else {
            return `Modify ${alterAction.fieldName}`;
          }
        }

      case 'remove':
        {
          const removeAction = action as RemoveAction;
          return `Remove ${removeAction.fieldName}`;
        }

      default:
        return '';
    }
  }

  getSystemProperties(message: ServiceBusMessage): {key: string, value: any}[] {
    return Object.entries(message)
      .filter(([key]) => {
        return key !== 'body' &&
               key !== 'applicationProperties' &&
               key !== 'deadLetterSource' &&
               key !== 'deadLetterReason' &&
               key !== 'deadLetterErrorDescription';
      })
      .map(([key, value]) => ({key, value}));
  }

  getApplicationProperties(message: ServiceBusMessage): {key: string, value: any}[] {
    if (!message.applicationProperties) return [];

    return Object.entries(message.applicationProperties)
      .map(([key, value]) => ({key, value}));
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return JSON.stringify(value);
    }

    return String(value);
  }
}
