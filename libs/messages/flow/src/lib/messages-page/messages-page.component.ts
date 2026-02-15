import {
  ApplicationRef,
  Component,
  computed,
  inject,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  MessagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, of, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  MessageFilter,
  MessagePage,
  PropertyFilter,
  ReceivedSystemPropertyKey,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { Card } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { ColorThemeService } from '@service-bus-browser/services';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { BASE_ROUTE } from '../const';
import { ScrollPanel } from 'primeng/scrollpanel';
import { EndpointSelectorTreeInputComponent } from '@service-bus-browser/topology-components';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { Menu } from 'primeng/menu';
import { MessageFilterEditorComponent } from '../message-filter-editor/message-filter-editor.component';
import { Tooltip } from 'primeng/tooltip';
import { hasActiveFilters as hasActiveFilterFunc } from '@service-bus-browser/filtering';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { Actions, ofType } from '@ngrx/effects';
import { contentResize } from '@service-bus-browser/actions';
import { systemPropertyKeys } from '@service-bus-browser/topology-contracts';
import { SystemPropertyHelpers } from '../systemproperty-helpers';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { UUID } from '@service-bus-browser/shared-contracts';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-messages-page',
  imports: [
    CommonModule,
    Card,
    TableModule,
    FormsModule,
    Dialog,
    Button,
    ContextMenu,
    ScrollPanel,
    EndpointSelectorTreeInputComponent,
    ButtonDirective,
    Menu,
    MessageFilterEditorComponent,
    Tooltip,
    EditorComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  systemPropertyHelpers = inject(SystemPropertyHelpers);
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  router = inject(Router);
  baseRoute = inject(BASE_ROUTE);
  actions = inject(Actions);
  appRef = inject(ApplicationRef);

  monacoEditor = viewChild<EditorComponent>('monacoEditor');

  displayBodyFullscreen = model<boolean>(false);
  displaySendMessages = model<boolean>(false);
  displayFilterDialog = model<boolean>(false);
  sendEndpoint = model<SendEndpoint | null>(null);
  currentPage = signal<MessagePage | null>(null);
  menuMessagesSelection = signal<ServiceBusReceivedMessage[]>([]);
  messageFilter = computed(() => {
    const currentPage = this.currentPage();
    return (
      currentPage?.filter ?? {
        systemProperties: [],
        applicationProperties: [],
        body: [],
      }
    );
  });
  virtualMessages = linkedSignal(() =>
    Array.from<ServiceBusReceivedMessage>({
      length: this.filteredMessageCount(),
    }),
  );

  selection = signal<string[]>([]);

  totalMessageCount = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap((page) => {
        if (!page) {
          return of(0);
        }
        return from(repository.countMessages(page.id));
      }),
    ),
  );
  filteredMessageCount = toSignal(
    combineLatest([
      toObservable(this.currentPage),
      toObservable(this.messageFilter),
    ]).pipe(
      switchMap(([page, filter]) => {
        if (!page) {
          return of(0);
        }
        return from(repository.countMessages(page.id, filter));
      }),
    ),
    {
      initialValue: 0,
    },
  );

  filteredPercentage = computed(() => {
    const total = this.totalMessageCount();
    return total ? (this.filteredMessageCount() / total) * 100 : 0;
  });
  hasActiveFilters = computed(() => {
    return hasActiveFilterFunc(this.messageFilter());
  });

  selectedMessage = toSignal(
    combineLatest([
      toObservable(this.currentPage),
      toObservable(this.selection),
    ]).pipe(
      switchMap(([currentPage, selection]) => {
        if (!currentPage || selection.length === 0) {
          return [];
        }

        return from(repository.getMessage(currentPage.id, selection[0]));
      }),
    ),
  );

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

  propertiesContextMenuSelection = signal<
    { key: systemPropertyKeys; value: unknown } | undefined
  >(undefined);
  customPropertiesContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);

  propertyMenuItems = computed(() => {
    let selection = this.propertiesContextMenuSelection();
    if (!selection) {
      selection = { key: 'contentType', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        command: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        command: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        command: () => {
          this.filterOnSystemProperty(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });
  customPropertyMenuItems = computed(() => {
    let selection = this.customPropertiesContextMenuSelection();
    if (!selection) {
      selection = { key: 'contentType', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        command: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        command: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        command: () => {
          this.filterOnApplicationProperty(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
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
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  }));

  cols = [
    { field: 'sequenceNumber', header: 'Sequence' },
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
    return this.getMenuItems(undefined, true);
  });

  constructor() {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          const pageId: string = params['pageId'];
          return this.store.select(MessagesSelectors.selectPage(pageId));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        if (!page) {
          this.router.navigateByUrl('/');
          return;
        }

        this.currentPage.set(page);
      });

    this.actions
      .pipe(ofType(contentResize), takeUntilDestroyed())
      .subscribe(() => {
        (this.monacoEditor() as any)?._editor.layout();
      });
  }

  getMenuItems(
    menuSelection: string | string[] | undefined,
    allMessages: boolean,
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
            this.menuMessagesSelection.set([]);
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
                messages: [],
              }),
            );
            this.router.navigate([this.baseRoute, 'batch-resend']);
          },
        },
        {
          label: allMessages ? 'Export all messages' : 'Export selection',
          icon: 'pi pi-download',
          command: () => {
            this.menuMessagesSelection.set([]);
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
          this.menuMessagesSelection.set([]);
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
            selectedMessage!,
          ]);
        },
      },
      {
        label: 'Export message',
        icon: 'pi pi-download',
        command: () => {
          this.menuMessagesSelection.set([]);
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
      }),
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
      }),
    );
  }

  openFilterDialog() {
    this.displayFilterDialog.set(true);
  }

  onFiltersUpdated(filter: MessageFilter) {
    this.store.dispatch(
      MessagesActions.setPageFilter({
        pageId: this.currentPage()!.id,
        filter: filter,
      }),
    );
  }

  protected filterOnSystemProperty(
    key: systemPropertyKeys,
    value: string | number | boolean | Date,
  ) {
    this.displayFilterDialog.set(false);
    const fieldType = typeof value as 'string' | 'number' | 'boolean' | 'date';

    let currentFilter = this.messageFilter();
    currentFilter = {
      ...currentFilter,
      systemProperties: [
        ...currentFilter.systemProperties,
        {
          fieldName: key,
          filterType: 'equals',
          value: value,
          fieldType: fieldType,
          isActive: true,
        } as PropertyFilter,
      ],
    };

    this.onFiltersUpdated(currentFilter);
  }

  protected filterOnApplicationProperty(
    key: string,
    value: string | number | boolean | Date,
  ) {
    this.displayFilterDialog.set(false);

    let currentFilter = this.messageFilter();
    currentFilter = {
      ...currentFilter,
      applicationProperties: [
        ...currentFilter.applicationProperties,
        {
          fieldName: key,
          filterType: 'equals',
          value: value,
          fieldType: this.systemPropertyHelpers.toFilterPropertyType(
            key as ReceivedSystemPropertyKey,
          ),
          isActive: true,
        } as PropertyFilter,
      ],
    };

    this.onFiltersUpdated(currentFilter);
  }

  protected async loadMessages($event: TableLazyLoadEvent) {
    const first = $event.first ?? 0;
    const rows = $event.rows ?? 0;

    await this.loadRows(first, rows, this.currentPage()!.id);

    //trigger change detection
    $event.forceUpdate?.();
  }

  private async loadRows(first: number, rows: number, pageId: UUID) {
    const messages = await repository.getMessages(
      pageId,
      this.messageFilter(),
      first,
      rows,
    );

    //populate page of virtual cars
    this.virtualMessages.update((vm) => {
      Array.prototype.splice.apply(vm, [first, rows, ...messages]);

      return vm;
    });
  }

  protected onSelectionChange($event: (string | ServiceBusReceivedMessage)[]) {
    const selection = $event
      .map((e) => (typeof e === 'string' ? e : (e.sequenceNumber ?? '')))
      .filter((e) => e !== '')
      // Distinct messages by sequence number
      .filter((e, i, arr) => arr.indexOf(e) === i);

    this.selection.set(selection);
    this.store.dispatch(
      MessagesActions.setPageSelection({
        pageId: this.currentPage()!.id,
        sequenceNumbers: selection,
      }),
    );

    this.appRef.tick();
  }
}
