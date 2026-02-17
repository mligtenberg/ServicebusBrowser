import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
  viewChild,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Action,
  AddAction,
  AlterAction,
  BatchActionTarget,
  MessageFilter,
  RemoveAction,
  ServiceBusMessage,
} from '@service-bus-browser/messages-contracts';
import { BatchActionsService } from '../batch-actions/batch-actions.service';
import { ActionComponent } from './components/action/action.component';
import { Store } from '@ngrx/store';
import {
  MessagesActions,
} from '@service-bus-browser/messages-store';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ActivatedRoute, Router } from '@angular/router';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { ColorThemeService, FilesService } from '@service-bus-browser/services';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { PreviewBatch } from './components/preview-batch/preview-batch';
import { ResendMessagesUtil } from '../resendmessages-util';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-messages-batch-resend',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionComponent,
    ButtonModule,
    ScrollPanelModule,
    DrawerModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    EndpointSelectorInputComponent,
    PreviewBatch,
  ],
  providers: [MessageService],
  templateUrl: './messages-batch-resend.component.html',
  styleUrl: './messages-batch-resend.component.scss',
})
export class MessagesBatchResendComponent {
  private activatedRoute = inject(ActivatedRoute);
  protected darkMode = inject(ColorThemeService).darkMode;
  private resendUtil = inject(ResendMessagesUtil);

  selection = toSignal<string[]>(
    this.activatedRoute.url.pipe(map(() => history.state.selection)),
  );

  messageFilter = toSignal<MessageFilter>(
    this.activatedRoute.url.pipe(map(() => history.state.filter)),
  );

  pageId = toSignal(
    this.activatedRoute.params.pipe(map((params) => params['pageId'])),
  );

  messageCount = toSignal(
    combineLatest([
      toObservable(this.pageId),
      toObservable(this.messageFilter),
      toObservable(this.selection),
    ]).pipe(
      switchMap(([pageId, messageFilter, selection]) =>
        repository.countMessages(pageId, messageFilter, selection),
      ),
    ),
  );

  actionEditor = viewChild<ActionComponent>('actionEditor');

  private store = inject(Store);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private fileService = inject(FilesService);

  protected actions = signal<Action[]>([]);
  protected previewDrawerVisible = signal(false);
  protected selectedEndpoint = model<SendEndpoint | null>(null);
  protected selectedEndpointForPreview = model<SendEndpoint | null>(null);
  protected editMode = signal(false);
  protected editModeIndex = signal(-1);
  protected currentAction = model<Action | undefined>();
  protected selectedMessageSequence = model<string | undefined>(undefined);

  protected previewMessage = toSignal(
    combineLatest([
      toObservable(this.selectedMessageSequence),
      toObservable(this.pageId),
    ]).pipe(
      switchMap(([selectedMessageSequence, pageId]) => {
        if (!selectedMessageSequence || !pageId) {
          return of(undefined);
        }

        return repository.getMessage(pageId, selectedMessageSequence);
      }),
    ),
  );

  storeAction(): void {
    const action = this.currentAction();

    if (action) {
      if (this.editMode()) {
        this.actions.update((currentActions) => {
          return currentActions.map((a, i) =>
            i === this.editModeIndex() ? action : a,
          );
        });
      } else {
        this.actions.update((currentActions) => [...currentActions, action]);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Action Added',
        detail: `${this.getActionTypeLabel(
          action.type,
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
    const file = await this.fileService.openFile(
      [
        {
          extensions: ['actionlist'],
          name: 'Action List',
        },
      ],
      'text',
    );

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

    const blob = new Blob([JSON.stringify(actionContainer)], {
      type: 'application/json',
    });
    await this.fileService.saveFile('export.actionlist', blob, [
      {
        extensions: ['actionlist'],
        name: 'Action List',
      },
    ]);
  }

  previewChanges() {
    this.previewDrawerVisible.set(true);
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
          messages: [selectedMessage],
        }),
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
        detail: 'Failed to send modified message. Check the logs for details.',
      });
    }

    this.previewDrawerVisible.set(false);
  }

  async resendMessages() {
    const selectedEndpoint = this.selectedEndpoint();
    if (!selectedEndpoint) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Endpoint',
        detail: 'Please select a destination endpoint for resending messages',
      });
      return;
    }

    const pageId = this.pageId();
    const selection = this.selection();
    await this.resendUtil.resendMessages(
      selectedEndpoint,
      pageId,
      this.messageFilter(),
      selection,
      this.actions(),
    );

    // Close the preview drawer if it's open
    this.previewDrawerVisible.set(false);

    // Navigate back to messages page
    this.router.navigate(['/']);
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
          addAction.value,
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
