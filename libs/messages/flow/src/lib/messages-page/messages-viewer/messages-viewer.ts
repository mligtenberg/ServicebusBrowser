import {
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ContextMenu } from 'primeng/contextmenu';
import { NgTemplateOutlet } from '@angular/common';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { Dialog } from 'primeng/dialog';
import { ColorThemeService } from '@service-bus-browser/services';
import { FormsModule } from '@angular/forms';
import { UUID } from '@service-bus-browser/shared-contracts';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, from, startWith, switchMap } from 'rxjs';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { systemPropertyKeys } from '@service-bus-browser/topology-contracts';
import { Editor } from '@service-bus-browser/shared-components';
import { Paginator, PaginatorState } from 'primeng/paginator';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-messages-viewer',
  imports: [
    Button,
    Card,
    ContextMenu,
    Editor,
    PrimeTemplate,
    TableModule,
    Dialog,
    FormsModule,
    NgTemplateOutlet,
    Paginator,
  ],
  templateUrl: './messages-viewer.html',
  styleUrl: './messages-viewer.scss',
})
export class MessagesViewer {
  private cdRef = inject(ChangeDetectorRef);
  colorThemeService = inject(ColorThemeService);

  // template references
  messagesHeader = contentChild('messagesHeader', { read: TemplateRef });
  messagesTable = viewChild.required('messagesTable', { read: Table });
  messagesPaginator = viewChild('messagesPaginator', { read: Paginator });

  // inputs
  lazy = input<boolean>(false);
  multiselect = input<boolean>(false);

  pageId = input.required<UUID>();
  messagesContextMenu = input<MenuItem[]>([]);
  applicationPropertiesContextMenu = input<MenuItem[]>([]);
  systemPropertiesContextMenu = input<MenuItem[]>([]);

  messages = input.required<ServiceBusReceivedMessage[]>();
  maxMessagesPerPage = input<number>(100000);

  selection = model<string | string[]>();
  systemPropertiesContextMenuSelection = model<
    { key: systemPropertyKeys; value: unknown } | undefined
  >(undefined);
  applicationPropertiesContextMenuSelection = model<
    { key: string; value: unknown } | undefined
  >(undefined);

  lazyLoadTriggered = output<TableLazyLoadEvent>();

  selectedMessage = toSignal(
    combineLatest([
      toObservable(this.pageId),
      toObservable(this.selection),
      toObservable(this.messages),
    ]).pipe(
      switchMap(([pageId, selection, messages]) => {
        if (typeof selection === 'object') {
          selection = selection[0];
        }

        if (selection === undefined || selection === null) {
          return [undefined];
        }

        const message = messages.find((m) => m?.sequenceNumber === selection);
        if (message) {
          return [message];
        }

        return from(repository.getMessage(pageId, selection)).pipe(
          startWith(undefined),
        );
      }),
    ),
  );

  currentPageNumber = signal(1);

  usePagination = computed(
    () => this.messages().length > this.maxMessagesPerPage(),
  );
  currentPageMessages = computed(() => {
    const currentPageIndex = this.currentPageNumber() - 1;
    const maxMessagesPerPage = this.maxMessagesPerPage();

    const startIndex = currentPageIndex * maxMessagesPerPage;
    const endIndex = startIndex + maxMessagesPerPage;

    const messages = this.messages().slice(startIndex, endIndex);
    return messages;
  });

  showMessageContextMenu = computed(
    () => this.messagesContextMenu().length > 0,
  );
  showApplicationPropertiesContextMenu = computed(
    () => this.applicationPropertiesContextMenu().length > 0,
  );
  showSystemPropertiesContextMenu = computed(
    () => this.systemPropertiesContextMenu().length > 0,
  );

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
  editorOptions = computed(() => ({
    theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
    readOnly: true,
    language: this.bodyLanguage(),
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  }));
  properties = computed<Array<{ key: string; value: unknown }>>(() => {
    const message = this.selectedMessage();
    if (!message) {
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
  applicationProperties = computed(() => {
    const applicationProperties = this.selectedMessage()?.applicationProperties;

    if (!applicationProperties) {
      return [];
    }

    return Object.entries(applicationProperties).map(([key, value]) => ({
      key,
      value,
    }));
  });

  // signals
  displayBodyFullscreen = signal(false);

  // statics
  cols = [
    { field: 'sequenceNumber', header: 'Sequence' },
    { field: 'messageId', header: 'Id' },
    { field: 'subject', header: 'Subject' },
  ];
  propertiesCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  constructor() {
    effect(() => {
      this.currentPageNumber();
      this.messagesTable().reset();
    });
  }

  reset() {
    this.messagesTable().reset();
    this.currentPageNumber.set(1);
    this.messagesPaginator()?.changePage(0);
  }

  protected onSelectionChange(
    $event: (string | ServiceBusReceivedMessage)[] | string,
  ) {
    if (typeof $event === 'string') {
      this.selection.set($event);
      return;
    }

    if ($event.some((e) => !e)) {
      return;
    }

    const selection = $event
      .map((e) => (typeof e === 'string' ? e : (e.sequenceNumber ?? '')))
      .filter((e) => e !== '')
      // Distinct messages by sequence number
      .filter((e, i, arr) => arr.indexOf(e) === i);

    this.selection.set(selection);
    setTimeout(() => this.cdRef.detectChanges());
  }

  protected onLazyLoad($event: TableLazyLoadEvent) {
    const previousPagesMessagesCount =
      (this.currentPageNumber() - 1) * this.maxMessagesPerPage();
    $event = {
      ...$event,
      first: previousPagesMessagesCount + ($event.first ?? 0),
      last: previousPagesMessagesCount + ($event.last ?? 0),
    };
    this.lazyLoadTriggered?.emit($event);
  }

  protected setPage($event: PaginatorState) {
    this.currentPageNumber.set(($event.page ?? 0) + 1);
  }
}
