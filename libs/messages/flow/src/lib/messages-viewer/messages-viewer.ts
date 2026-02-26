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
import { ContextMenu } from 'primeng/contextmenu';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { UUID } from '@service-bus-browser/shared-contracts';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, from, startWith, switchMap } from 'rxjs';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { systemPropertyKeys } from '@service-bus-browser/topology-contracts';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BodyViewer } from '../body-viewer/body-viewer';
import { Splitter } from 'primeng/splitter';
import { ScrollPanel } from 'primeng/scrollpanel';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-messages-viewer',
  imports: [
    ContextMenu,
    PrimeTemplate,
    TableModule,
    FormsModule,
    NgTemplateOutlet,
    Paginator,
    BodyViewer,
    DatePipe,
    Splitter,
    ScrollPanel,
    NgClass,
  ],
  templateUrl: './messages-viewer.html',
  styleUrl: './messages-viewer.scss',
})
class MessagesViewer {
  private cdRef = inject(ChangeDetectorRef);

  // template references
  messagesHeader = contentChild('messagesHeader', { read: TemplateRef });
  messagesTable = viewChild.required('messagesTable', { read: Table });
  messagesPaginator = viewChild('messagesPaginator', { read: Paginator });

  // inputs
  lazy = input<boolean>(false);
  multiselect = input<boolean>(false);
  isLoading = input<boolean>(false);

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
  isResizing = signal(false);

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

    return this.messages().slice(startIndex, endIndex);
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
    const message = this.selectedMessage();
    if (!message) {
      return [];
    }

    return Object.entries(message ?? {})
      .map(([key, value]) => ({ key, value }))
      .filter(
        ({ key }) => !['key', 'body', 'applicationProperties'].includes(key),
      )
      .map(({ key, value }) => {
        // key should become a human readable string, not camel case
        const keyParts = key
          .split(/(?=[A-Z])/)
          .map((part) => part.toLowerCase());
        const humanReadableKey = keyParts.join(' ');
        return { key: humanReadableKey, value };
      });
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
    setTimeout(() => this.cdRef.detectChanges(), 100);
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
    this.messagesTable().scrollToVirtualIndex(0);
  }

  protected dateGuard(value: unknown): value is Date {
    return value instanceof Date;
  }

  protected onResize() {
    this.cdRef.detectChanges();
  }

  protected readonly Date = Date;
}

export default MessagesViewer;
