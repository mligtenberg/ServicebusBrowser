import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild, model, computed, effect } from '@angular/core';
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
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ActivatedRoute, Router } from '@angular/router';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { ColorThemeService, FilesService } from '@service-bus-browser/services';
import { Listbox } from 'primeng/listbox';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

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
    TooltipModule,
    EndpointSelectorInputComponent,
    Listbox,
  ],
  providers: [BatchActionsService, MessageService],
  templateUrl: './messages-batch-resend.component.html',
  styleUrl: './messages-batch-resend.component.scss',
})
export class MessagesBatchResendComponent {
  darkMode = inject(ColorThemeService).darkMode;

  actionEditor = viewChild<ActionComponent>('actionEditor');

  private batchActionsService = inject(BatchActionsService);
  private store = inject(Store);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private fileService = inject(FilesService);
  private activatedRoute = inject(ActivatedRoute);

  // Load page from store based on route param
  private currentPageId = toSignal(
    this.activatedRoute.params.pipe(map(params => params['pageId'] as string))
  );

  private currentPage = toSignal(
    this.activatedRoute.params.pipe(
      switchMap(params =>
        this.store.select(MessagesSelectors.selectBatchResendPage(params['pageId']))
      )
    )
  );

  protected actions = signal<Action[]>([]);
  protected previewDialogVisible = signal(false);
  protected selectedEndpoint = model<SendEndpoint | null >(null);
  protected editMode = signal(false);
  protected editModeIndex = signal(-1);
  protected currentAction = model<Action | undefined>();
  protected selectedMessage = model<ServiceBusMessage | undefined>(undefined);
  private isLoadingFromStore = signal(false);

  protected originalMessages = computed(() => this.currentPage()?.messages ?? []);
  protected previewBatch = computed(() => this.originalMessages().slice(0, 100))
  protected previewMessage = computed(() => {
    const selectedMessage = this.selectedMessage();
    if (!selectedMessage) {
      return null;
    }

    return this.batchActionsService.applyBatchActionsToMessage(
      selectedMessage,
      this.actions()
    );
  });

  // Sync local state with store state
  constructor() {
    effect(() => {
      const page = this.currentPage();
      if (page) {
        this.isLoadingFromStore.set(true);
        this.actions.set(page.actions);
        this.selectedEndpoint.set(page.selectedEndpoint);
        // Use setTimeout to allow signals to settle before re-enabling saves
        setTimeout(() => this.isLoadingFromStore.set(false), 0);
      }
    });

    // Save actions to store when they change (but not during load)
    effect(() => {
      const pageId = this.currentPageId();
      const actions = this.actions();
      if (pageId && !this.isLoadingFromStore()) {
        this.store.dispatch(
          MessagesActions.updateBatchResendPage({
            pageId,
            actions
          })
        );
      }
    }, { allowSignalWrites: true });

    // Save endpoint to store when it changes (but not during load)
    effect(() => {
      const pageId = this.currentPageId();
      const endpoint = this.selectedEndpoint();
      if (pageId && !this.isLoadingFromStore()) {
        this.store.dispatch(
          MessagesActions.updateBatchResendPage({
            pageId,
            selectedEndpoint: endpoint
          })
        );
      }
    }, { allowSignalWrites: true });
  }

  storeAction(): void {
    const action = this.currentAction();

    if (action) {
      if (this.editMode()) {
        this.actions.update((currentActions) => {
          return currentActions.map((a, i) =>
            i === this.editModeIndex() ? action : a
          );
        });
      } else {
        this.actions.update((currentActions) => [...currentActions, action]);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Action Added',
        detail: `${this.getActionTypeLabel(
          action.type
        )} action added successfully`,
      });

      this.currentAction.set(undefined);
      this.editMode.set(false);
      this.actionEditor()?.clear();
    }
  }

  clearAction(): void {
    this.currentAction.set(undefined);
    this.editMode.set(false);
    this.actionEditor()?.clear();
  }

  editAction(index: number) {
    const actions = this.actions();
    const action = actions[index];

    if (!action) {
      return;
    }

    this.editMode.set(true);
    this.editModeIndex.set(index);

    this.currentAction.set(action);
  }

  removeAction(index: number) {
    this.actions.update((currentActions) => {
      const newActions = [...currentActions];
      newActions.splice(index, 1);
      return newActions;
    });
  }

  canAddAction(): boolean {
    return !!this.currentAction();
  }

  async importActions() {
    const file = await this.fileService.openFile([
      {
        extensions: ['actionlist'],
        name: 'Action List',
      },
    ], 'text');

    if (!file) return;

    const actionContainer = JSON.parse(file.contents) as {
      verion: number;
      actions: Action[];
    };
    this.actions.set(actionContainer.actions);
  }

  async exportActions() {
    const actionContainer = {
      verion: 1,
      actions: this.actions(),
    };

    await this.fileService.saveFile('export.actionlist', JSON.stringify(actionContainer), [
      {
        extensions: ['actionlist'],
        name: 'Action List',
      },
    ]);
  }

  getMessageListLine(message: ServiceBusMessage) {
    if (message.subject && message.subject.length > 0) {
      return message.subject;
    }

    return message.messageId;
  }

  previewChanges() {
    if (this.originalMessages().length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Messages',
        detail: 'No messages to preview changes',
      });
      return;
    }

    this.selectedMessage.set(undefined);
    this.previewDialogVisible.set(true);
  }

  resendSelectedMessage() {
    const selectedMessage = this.previewMessage();
    const selectedEndpoint = this.selectedEndpoint();

    if (!selectedMessage) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Messages',
        detail: 'No messages to resend',
      });
      return;
    }
    if (!selectedEndpoint) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Endpoint',
        detail: 'Please select a destination endpoint for resending messages',
      });
      return;
    }

    try {
      this.store.dispatch(
        MessagesActions.sendMessages({
          endpoint: selectedEndpoint,
          messages: [selectedMessage]
        })
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Message Sent',
        detail: `Selected message has been sent`,
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Failed to send modified message. Check the logs for details.',
      });
    }
  }

  resendMessages() {
    const selectedEndpoint = this.selectedEndpoint();
    if (this.originalMessages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Messages',
        detail: 'No messages to resend',
      });
      return;
    }

    if (!selectedEndpoint) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Endpoint',
        detail: 'Please select a destination endpoint for resending messages',
      });
      return;
    }

    try {
      let messagesToSend: ServiceBusMessage[] = [];

      // Otherwise, apply actions to all original messages
      messagesToSend = this.batchActionsService.applyBatchActions(
        this.originalMessages(),
        this.actions()
      );

      if (messagesToSend && messagesToSend.length > 0) {
        this.store.dispatch(
          MessagesActions.sendMessages({
            endpoint: selectedEndpoint,
            messages: messagesToSend,
          })
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Messages Sent',
          detail: `${messagesToSend.length} messages have been sent`,
        });

        // Close the preview dialog if it's open
        this.previewDialogVisible.set(false);

        // Navigate back to messages page
        this.router.navigate(['/']);
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Failed to send modified messages. Check the logs for details.',
      });
    }
  }

  getActionTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      add: 'Add',
      alter: 'Alter',
      remove: 'Remove',
    };

    return typeMap[type] || type;
  }

  getActionTargetLabel(target: BatchActionTarget): string {
    const targetMap: Record<string, string> = {
      body: 'Body',
      systemProperties: 'System Properties',
      applicationProperties: 'Application Properties',
    };

    return targetMap[target] || target;
  }

  getActionDescription(action: Action): string {
    switch (action.type) {
      case 'add': {
        const addAction = action as AddAction;
        return `Add ${addAction.fieldName} = ${this.formatValue(
          addAction.value
        )}`;
      }

      case 'alter': {
        const alterAction = action as AlterAction;
        if (alterAction.target === 'body') {
          return `Modify message body`;
        } else {
          return `Modify ${alterAction.fieldName}`;
        }
      }

      case 'remove': {
        const removeAction = action as RemoveAction;
        return `Remove ${removeAction.fieldName}`;
      }

      default:
        return '';
    }
  }

  getSystemProperties(
    message: ServiceBusMessage
  ): { key: string; value: any }[] {
    return Object.entries(message)
      .filter(([key]) => {
        return (
          key !== 'body' &&
          key !== 'applicationProperties' &&
          key !== 'deadLetterSource' &&
          key !== 'deadLetterReason' &&
          key !== 'deadLetterErrorDescription'
        );
      })
      .map(([key, value]) => ({ key, value }));
  }

  getApplicationProperties(
    message: ServiceBusMessage
  ): { key: string; value: any }[] {
    if (!message.applicationProperties) return [];

    return Object.entries(message.applicationProperties).map(
      ([key, value]) => ({ key, value })
    );
  }

  moveActionUp(index: number) {
    const actions = this.actions();
    const action = actions[index];

    if (!action) {
      return;
    }

    this.actions.update((currentActions) => {
      const newActions = [...currentActions];
      const actionIndex = newActions.indexOf(action);
      if (actionIndex > 0) {
        newActions.splice(actionIndex, 1);
        newActions.splice(actionIndex - 1, 0, action);
      }
      return newActions;
    });
  }

  moveActionDown(index: number) {
    const actions = this.actions();
    const action = actions[index];

    if (!action) {
      return;
    }

    this.actions.update((currentActions) => {
      const newActions = [...currentActions];
      const actionIndex = newActions.indexOf(action);
      if (actionIndex >= 0 && actionIndex < newActions.length - 1) {
        newActions.splice(actionIndex, 1);
        newActions.splice(actionIndex + 1, 0, action);
      }
      return newActions;
    });
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
