import { Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  MessagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MessageFilter,
  MessagePage,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ColorThemeService } from '@service-bus-browser/services';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { BASE_ROUTE } from '../const';
import { ScrollPanel } from 'primeng/scrollpanel';
import { EndpointSelectorTreeInputComponent } from '@service-bus-browser/topology-components';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { Menu } from 'primeng/menu';
import { MessageFilterDialogComponent } from '../message-filter-dialog/message-filter-dialog.component';
import { Tooltip } from 'primeng/tooltip';
import { filterMessages, hasActiveFilters as hasActiveFilterFunc } from '@service-bus-browser/filtering';

@Component({
  selector: 'lib-messages-page.ts',
  imports: [
    CommonModule,
    Card,
    TableModule,
    FormsModule,
    Dialog,
    Button,
    EditorComponent,
    ContextMenu,
    ScrollPanel,
    EndpointSelectorTreeInputComponent,
    ButtonDirective,
    Menu,
    MessageFilterDialogComponent,
    Tooltip,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  router = inject(Router);
  baseRoute = inject(BASE_ROUTE);

  displayBodyFullscreen = model<boolean>(false);
  displaySendMessages = model<boolean>(false);
  displayFilterDialog = model<boolean>(false);
  sendEndpoint = model<SendEndpoint | null>(null);
  currentPage = signal<MessagePage | null>(null);
  filteredMessages = computed(() => {
    const page = this.currentPage();
    if (!page) return [];

    const filter = this.messageFilter();
    const messages = page.messages;

    return filterMessages(messages, filter);
  });
  selection = model<ServiceBusReceivedMessage[] | undefined>(undefined);
  menuMessagesSelection = signal<ServiceBusReceivedMessage[]>([]);
  messageFilter = computed(() => {
    const currentPage = this.currentPage();
    return currentPage?.filter ?? {
      systemProperties: [],
      applicationProperties: [],
      body: [],
    };
  })
  totalMessageCount = computed(() => this.currentPage()?.messages.length ?? 0);
  filteredMessageCount = computed(() => this.filteredMessages().length);
  filteredPercentage = computed(() => {
    const total = this.totalMessageCount();
    return total ? (this.filteredMessageCount() / total) * 100 : 0;
  });
  hasActiveFilters = computed(() => {
    return hasActiveFilterFunc(this.messageFilter());
  });
  selectedMessage = computed(() => {
    const selection = this.selection();
    if (Array.isArray(selection) && selection.length === 1) {
      return selection[0];
    }
    if (Array.isArray(selection)) {
      return undefined;
    }
    return selection;
  });
  body = computed(() => {
    const message = this.selectedMessage();
    if (!message) {
      return '';
    }

    if (typeof message.body === 'string') {
      return message.body;
    }

    return JSON.stringify(message.body, null, 2);
  });

  properties = computed<Array<{ key: string; value: unknown }>>(() => {
    const currentPage = this.currentPage();
    const message = this.selectedMessage();
    if (!currentPage || !message) {
      return [];
    }

    return [
      { key: 'contentType', value: message.contentType },
      { key: 'correlationId', value: message.correlationId },
      { key: 'enqueueSequenceNumber', value: message.enqueuedSequenceNumber },
      { key: 'enqueuedTimeUtc', value: message.enqueuedTimeUtc },
      { key: 'messageId', value: message.messageId },
      { key: 'sequenceNumber', value: message.sequenceNumber },
      { key: 'subject', value: message.subject },
      { key: 'timeToLive', value: message.timeToLive },
      { key: 'to', value: message.to },
    ];
  });
  customProperties = computed(() => {
    const applicationProperties = this.selectedMessage()?.applicationProperties;

    if (!applicationProperties) {
      return [];
    }

    return Object.entries(applicationProperties).map(([key, value]) => ({
      key,
      value,
    }));
  });

  bodyLanguage = computed(() => {
    const message = this.selectedMessage();
    if (!message?.contentType) {
      return '';
    }

    const contentType = message.contentType.toLowerCase();

    if (contentType.includes('json')) {
      return 'json';
    }

    if (contentType.includes('xml')) {
      return 'xml';
    }

    if (contentType.includes('yaml') || contentType.includes('yml')) {
      return 'yaml';
    }

    if (contentType.includes('ini')) {
      return 'ini';
    }

    if (contentType.includes('toml')) {
      return 'TOML';
    }

    return 'text';
  });

  colorThemeService = inject(ColorThemeService);
  editorOptions = computed(() => ({
    theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
    readOnly: true,
    language: this.bodyLanguage(),
    automaticLayout: false,
    minimap: {
      enabled: false,
    },
  }));

  cols = [
    { field: 'sequenceNumber', header: 'Sequence Number' },
    { field: 'messageId', header: 'Id' },
    { field: 'subject', header: 'Subject' },
  ];
  propertiesCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  messageContextMenu = computed<MenuItem[]>(() => {
    const contextMenuSelection = this.selection();
    return this.getMenuItems(contextMenuSelection, false);
  });

  allMessagesMenu = computed<MenuItem[]>(() => {
    const menuSelection = this.filteredMessages();
    return this.getMenuItems(menuSelection, true);
  });

  constructor() {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          const pageId: string = params['pageId'];
          this.selection.set(undefined);
          return this.store.select(MessagesSelectors.selectPage(pageId));
        }),
        takeUntilDestroyed()
      )
      .subscribe((page) => {
        if (!page) {
          this.router.navigateByUrl('/');
          return;
        }

        this.currentPage.set(page);
      });
  }

  getMenuItems(
    menuSelection:
      | ServiceBusReceivedMessage
      | ServiceBusReceivedMessage[]
      | undefined,
    allMessages: boolean
  ) {
    if (!menuSelection) {
      return [];
    }

    if (Array.isArray(menuSelection) && menuSelection.length === 0) {
      return [];
    }

    if (Array.isArray(menuSelection) && menuSelection.length > 1) {
      return [
        {
          label: allMessages
            ? 'Quick resend all messages'
            : 'Quick selected resend messages',
          icon: 'pi pi-envelope',
          command: () => {
            this.menuMessagesSelection.set(menuSelection);
            this.displaySendMessages.set(true);
          },
        },
        {
          label: allMessages
            ? 'Batch resend all messages'
            : 'Batch resend selected messages',
          icon: 'pi pi-envelope',
          command: () => {
            this.store.dispatch(
              MessagesActions.setBatchResendMessages({
                messages: menuSelection,
              })
            );
            this.router.navigate([this.baseRoute, 'batch-resend']);
          },
        },
        {
          label: allMessages ? 'Export all messages' : 'Export selection',
          icon: 'pi pi-download',
          command: () => {
            this.menuMessagesSelection.set(menuSelection);
            this.exportMessages();
          },
        },
      ];
    }

    const selectedMessage = Array.isArray(menuSelection)
      ? menuSelection[0]
      : menuSelection;

    return [
      {
        label: 'Quick resend message',
        icon: 'pi pi-envelope',
        command: () => {
          this.menuMessagesSelection.set(
            Array.isArray(menuSelection) ? menuSelection : [selectedMessage]
          );
          this.displaySendMessages.set(true);
        },
      },
      {
        label: allMessages ? 'Resend message' : 'Resend selected message',
        icon: 'pi pi-envelope',
        command: () => {
          this.router.navigate([
            this.baseRoute,
            'resend',
            this.currentPage()!.id,
            selectedMessage!.messageId,
          ]);
        },
      },
      {
        label: 'Export message',
        icon: 'pi pi-download',
        command: () => {
          this.menuMessagesSelection.set(
            Array.isArray(menuSelection) ? menuSelection : [selectedMessage]
          );
          this.exportMessages();
        },
      },
    ];
  }

  sendMessages() {
    const messages = this.menuMessagesSelection();
    const endpoint = this.sendEndpoint();
    if (
      !endpoint ||
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      console.error('Invalid endpoint or messages');
      return;
    }

    this.displaySendMessages.set(false);
    this.store.dispatch(
      MessagesActions.sendMessages({
        endpoint,
        messages,
      })
    );
  }

  exportMessages() {
    const messagesToExport = this.menuMessagesSelection();
    const currentPage = this.currentPage();
    if (!currentPage || messagesToExport.length === 0) {
      return;
    }

    this.store.dispatch(
      MessagesActions.exportMessages({
        pageName: currentPage.name,
        messages: messagesToExport,
      })
    );
  }

  openFilterDialog() {
    this.displayFilterDialog.set(true);
  }

  onFiltersUpdated(filter: MessageFilter) {
    this.store.dispatch(MessagesActions.setPageFilter({
      pageId: this.currentPage()!.id,
      filter: filter,
    }));
  }

  clearFilters() {
    this.store.dispatch(MessagesActions.setPageFilter({
      pageId: this.currentPage()!.id,
      filter: {
        systemProperties: [],
        applicationProperties: [],
        body: [],
      },
    }));
  }
}
