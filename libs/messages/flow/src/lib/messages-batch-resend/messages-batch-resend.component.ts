import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, signal, viewChild, model, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionComponent } from './components/action/action.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import {
  messagePagesActions,
  messagesActions,
} from '@service-bus-browser/messages-store';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, MenuItem } from 'primeng/api';
import {
  SendEndpoint,
  ToMessageToSend,
} from '@service-bus-browser/api-contracts';
import { ActivatedRoute, Router } from '@angular/router';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { ColorThemeService, FilesService } from '@service-bus-browser/services';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { Popover } from 'primeng/popover';
import { EditorContextAction } from '@service-bus-browser/shared-components';

// FIRE_AND_FORGET_REPOSITORY: assigned in a microtask before NgRx effects run
let repository!: Awaited<ReturnType<typeof getMessagesRepository>>;
getMessagesRepository().then((r) => (repository = r));
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { PreviewBatch } from './components/preview-batch/preview-batch';
import { MessageFilter } from '@service-bus-browser/filtering';
import {
  AddAction,
  AlterAction,
  BatchActionTarget,
  MessageModificationAction,
  RemoveAction,
} from '@service-bus-browser/message-modification-engine';
import { Splitter } from 'primeng/splitter';
import { SplitButton } from 'primeng/splitbutton';


@Component({
  selector: 'lib-messages-batch-resend',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionComponent,
    ButtonModule,
    ScrollPanelModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    EndpointSelectorInputComponent,
    PreviewBatch,
    Splitter,
    SplitButton,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    Popover,
  ],
  providers: [MessageService],
  templateUrl: './messages-batch-resend.component.html',
  styleUrl: './messages-batch-resend.component.scss',
})
export class MessagesBatchResendComponent {
  private activatedRoute = inject(ActivatedRoute);
  protected darkMode = inject(ColorThemeService).darkMode;

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

  applicationPropertyLabels = toSignal(
    toObservable(this.pageId).pipe(
      switchMap((pageId) => {
        if (!pageId) return of([] as { label: string; type: string }[]);
        return repository.getApplicationPropertyLabels(pageId);
      }),
      map((labels) => labels.map((l) => l.label)),
    ),
    { initialValue: [] as string[] },
  );

  actionEditor = viewChild<ActionComponent>('actionEditor');
  actionPopover = viewChild<Popover>('actionPopover');
  addActionBtn = viewChild('addActionBtn', { read: ElementRef });

  private store = inject(Store);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private fileService = inject(FilesService);

  // Exposed in the preview body editor's right-click menu: select text in the
  // body, then turn the selection into a search & replace body action.
  protected bodyContextActions: EditorContextAction[] = [
    {
      id: 'add-search-replace-body-action',
      label: 'Add search & replace action',
      run: (selectedText) => this.openSearchReplaceBodyAction(selectedText),
    },
  ];

  protected actions = signal<MessageModificationAction[]>([]);
  protected selectedEndpoint = model<SendEndpoint | null>(null);
  protected editMode = signal(false);
  protected editModeIndex = signal(-1);
  protected currentAction = model<MessageModificationAction | undefined>();
  protected selectedMessageSequence = model<string | undefined>(undefined);

  // Context menu selection tracking — one per property table in the preview
  protected propertiesContextMenuSelection = signal<{ key: string; value: unknown } | undefined>(undefined);
  protected applicationPropertiesContextMenuSelection = signal<{ key: string; value: unknown } | undefined>(undefined);
  protected headersContextMenuSelection = signal<{ key: string; value: unknown } | undefined>(undefined);
  protected deliveryAnnotationsContextMenuSelection = signal<{ key: string; value: unknown } | undefined>(undefined);
  protected messageAnnotationsContextMenuSelection = signal<{ key: string; value: unknown } | undefined>(undefined);

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

  protected sendBatchDisabled = computed(
    () => !this.selectedEndpoint() || !this.messageCount(),
  );

  protected sendSelectionDisabled = computed(
    () => !this.selectedMessageSequence(),
  );

  protected splitButtonItems = computed<MenuItem[]>(() => [
    {
      label: 'Send selection',
      icon: 'pi pi-send',
      disabled: this.sendSelectionDisabled(),
      command: () => this.resendSelectedMessage(),
    },
  ]);

  // Context menus for the five property tables in the preview panel
  private actionMenuItems(key: string, target: BatchActionTarget): MenuItem[] {
    return [
      {
        label: `Alter ${key}`,
        icon: 'pi pi-pencil',
        command: () => this.openDraftActionPopover(key, target),
      },
      {
        label: `Remove ${key}`,
        icon: 'pi pi-trash',
        // A remove action is fully defined by its target and field name, so add
        // it directly without opening the editor.
        command: () => this.addRemoveAction(key, target),
      },
    ];
  }

  private emptyFilter(): MessageFilter {
    return {
      body: [],
      headers: [],
      properties: [],
      deliveryAnnotations: [],
      messageAnnotations: [],
      applicationProperties: [],
    };
  }

  addRemoveAction(key: string, target: BatchActionTarget): void {
    const removeAction: MessageModificationAction = {
      type: 'remove',
      target: target as 'properties' | 'applicationProperties',
      fieldName: key,
      applyOnFilter: this.emptyFilter(),
    } as MessageModificationAction;

    this.actions.update((currentActions) => [...currentActions, removeAction]);

    this.messageService.add({
      severity: 'success',
      summary: 'Action Added',
      detail: `Remove action for ${key} added successfully`,
    });
  }

  openSearchReplaceBodyAction(searchValue: string): void {
    const prefilled: MessageModificationAction = {
      type: 'alter',
      target: 'body',
      alterType: 'searchAndReplace',
      searchValue,
      value: '',
      applyOnFilter: this.emptyFilter(),
    } as MessageModificationAction;

    // Open a prefilled Add dialog — nothing is added to the list until Save.
    this.editMode.set(false);
    this.editModeIndex.set(-1);
    this.currentAction.set(prefilled);
    this.showDraftPopover();
  }

  protected propertiesContextMenu = computed<MenuItem[]>(() => {
    const selection = this.propertiesContextMenuSelection() ?? { key: 'subject', value: '' };
    return this.actionMenuItems(selection.key, 'properties');
  });

  protected applicationPropertiesContextMenu = computed<MenuItem[]>(() => {
    const selection = this.applicationPropertiesContextMenuSelection() ?? { key: 'contentType', value: '' };
    return this.actionMenuItems(selection.key, 'applicationProperties');
  });

  protected headersContextMenu = computed<MenuItem[]>(() => {
    const selection = this.headersContextMenuSelection() ?? { key: 'durable', value: '' };
    return this.actionMenuItems(selection.key, 'properties');
  });

  protected deliveryAnnotationsContextMenu = computed<MenuItem[]>(() => {
    const selection = this.deliveryAnnotationsContextMenuSelection() ?? { key: 'x-opt-enqueued-time', value: '' };
    return this.actionMenuItems(selection.key, 'properties');
  });

  protected messageAnnotationsContextMenu = computed<MenuItem[]>(() => {
    const selection = this.messageAnnotationsContextMenuSelection() ?? { key: 'x-opt-sequence-number', value: '' };
    return this.actionMenuItems(selection.key, 'properties');
  });

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  // The pointer coordinates of the last right-click, captured in the capture
  // phase so it is recorded even though PrimeNG's context menu (and Monaco) stop
  // the event from bubbling. Used to anchor the draft popover at the click.
  private lastContextMenuPosition: { x: number; y: number } | undefined;
  private popoverAnchorEl: HTMLElement | undefined;

  constructor() {
    const onContextMenu = (event: MouseEvent) => {
      this.lastContextMenuPosition = { x: event.clientX, y: event.clientY };
    };
    this.document.addEventListener('contextmenu', onContextMenu, true);
    this.destroyRef.onDestroy(() =>
      this.document.removeEventListener('contextmenu', onContextMenu, true),
    );
  }

  openAddActionPopover(event: Event): void {
    this.editMode.set(false);
    this.editModeIndex.set(-1);
    this.currentAction.set(undefined);
    this.actionEditor()?.clear();
    this.actionPopover()?.show(event);
  }

  openEditActionPopover(event: Event, index: number): void {
    const actions = this.actions();
    const action = actions[index];

    if (!action) {
      return;
    }
    this.editMode.set(true);
    this.editModeIndex.set(index);
    this.currentAction.set(action);
    this.actionPopover()?.show(event);
  }

  openDraftActionPopover(key: string, target: BatchActionTarget): void {
    const prefilled: MessageModificationAction = {
      type: 'alter',
      target: target as 'properties' | 'applicationProperties',
      fieldName: key,
      value: '',
      alterType: 'fullReplace',
      applyOnFilter: this.emptyFilter(),
    } as MessageModificationAction;

    // Open a prefilled Add dialog — nothing is added to the list until Save.
    this.editMode.set(false);
    this.editModeIndex.set(-1);
    this.currentAction.set(prefilled);
    this.showDraftPopover();
  }

  /**
   * Anchor the draft popover at the location that was right-clicked. The menu
   * item's own event target is detached by the time the command runs, so use a
   * tiny absolutely-positioned anchor placed at the recorded pointer position.
   * Fall back to the "Add action" button if no position was recorded.
   */
  private showDraftPopover(): void {
    const position = this.lastContextMenuPosition;
    if (!position) {
      this.actionPopover()?.show(
        new Event('click'),
        this.addActionBtn()?.nativeElement,
      );
      return;
    }

    const anchor = this.document.createElement('div');
    anchor.style.position = 'fixed';
    anchor.style.left = `${position.x}px`;
    anchor.style.top = `${position.y}px`;
    anchor.style.width = '1px';
    anchor.style.height = '1px';
    anchor.style.pointerEvents = 'none';
    this.document.body.appendChild(anchor);
    this.popoverAnchorEl = anchor;

    this.actionPopover()?.show(new Event('click'), anchor);
  }

  private removePopoverAnchor(): void {
    this.popoverAnchorEl?.remove();
    this.popoverAnchorEl = undefined;
  }

  savePopoverAction(): void {
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
        summary: 'Action Saved',
        detail: `${this.getActionTypeLabel(action.type)} action saved successfully`,
      });
    }

    this.actionPopover()?.hide();
  }

  cancelPopoverAction(): void {
    this.actionPopover()?.hide();
  }

  onPopoverHide(): void {
    this.removePopoverAnchor();
    this.currentAction.set(undefined);
    this.editMode.set(false);
    this.editModeIndex.set(-1);
    this.actionEditor()?.clear();
  }

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
      actions: MessageModificationAction[];
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
        summary: 'Missing endpoints',
        detail: 'Please select a destination endpoint for resending messages',
      });
      return;
    }

    const sendMessage = ToMessageToSend(selectedMessage);

    try {
      this.store.dispatch(
        messagesActions.sendMessage({
          endpoint: selectedEndpoint,
          message: {
            bodyBase64: (sendMessage.body as any).toBase64(),
            messageId: sendMessage.messageId,
            headers: sendMessage.headers,
            properties: sendMessage.properties,
            deliveryAnnotations: sendMessage.deliveryAnnotations,
            messageAnnotations: sendMessage.messageAnnotations,
            contentType: sendMessage.contentType,
            applicationProperties: sendMessage.applicationProperties,
          },
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
  }

  async resendMessages() {
    const selectedEndpoint = this.selectedEndpoint();
    if (!selectedEndpoint) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing endpoints',
        detail: 'Please select a destination endpoint for resending messages',
      });
      return;
    }

    const pageId = this.pageId();
    const selection = this.selection();

    this.store.dispatch(
      messagePagesActions.resendMessages({
        pageId,
        endpoint: selectedEndpoint,
        messageFilter: this.messageFilter(),
        selectionKeys: selection,
        modificationActions: this.actions(),
      }),
    );

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
      properties: 'Properties',
      applicationProperties: 'Application Properties',
    };

    return targetMap[target] || target;
  }

  getActionDescription(action: MessageModificationAction): string {
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

  dropAction(event: CdkDragDrop<MessageModificationAction[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.actions.update((currentActions) => {
      const arr = [...currentActions];
      moveItemInArray(arr, event.previousIndex, event.currentIndex);
      return arr;
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
