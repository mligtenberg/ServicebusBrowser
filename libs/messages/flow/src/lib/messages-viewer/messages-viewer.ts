import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { UUID } from '@service-bus-browser/shared-contracts';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, from, startWith, switchMap } from 'rxjs';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { systemPropertyKeys } from '@service-bus-browser/service-bus-api-contracts';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BodyViewer } from '../body-viewer/body-viewer';
import { Splitter } from 'primeng/splitter';
import { ScrollPanel } from 'primeng/scrollpanel';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';

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
class MessagesViewer implements AfterViewInit, OnDestroy {
  protected cdRef = inject(ChangeDetectorRef);
  protected resizeObserver?: ResizeObserver;

  // template references
  messagesHeader = contentChild('messagesHeader', { read: TemplateRef });
  messagesTable = viewChild.required('messagesTable', { read: Table });
  messagesPaginator = viewChild('messagesPaginator', { read: Paginator });
  container = viewChild.required('container', { read: ElementRef });

  // inputs
  lazy = input<boolean>(false);
  multiselect = input<boolean>(false);
  isLoading = input<boolean>(false);

  pageId = input.required<UUID>();
  messagesContextMenu = input<MenuItem[]>([]);
  applicationPropertiesContextMenu = input<MenuItem[]>([]);
  systemPropertiesContextMenu = input<MenuItem[]>([]);

  messages = input.required<ReceivedMessage[]>();
  maxMessagesPerPage = input<number>(100000);
  containerWidth = signal<number>(0);

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

        const message = messages.find((m) => m?.key === selection);
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

    return new TextDecoder().decode(message.body.buffer);
  });

  systemProperties = computed<Array<{ key: string; value: unknown }>>(() => {
    const systemProperties = this.selectedMessage()?.systemProperties;

    if (!systemProperties) {
      return [];
    }

    return Object.entries(systemProperties).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  });
  applicationProperties = computed(() => {
    const applicationProperties = this.selectedMessage()?.applicationProperties;

    if (!applicationProperties) {
      return [];
    }

    return Object.entries(applicationProperties).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  });

  // statics
  cols = [
    { field: 'sequence', header: 'Sequence' },
    { field: 'messageId', header: 'Id' },
    { field: 'systemProperties.subject', header: 'Subject' },
  ];
  propertiesCols = [
    { field: 'label', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  constructor() {
    effect(() => {
      this.currentPageNumber();
      this.messagesTable().reset();
    });
  }
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width: containerWidth } = entry.contentRect;
      this.containerWidth.set(containerWidth);
    });
    this.resizeObserver.observe(this.container().nativeElement);
  }

  reset() {
    this.messagesTable().reset();
    this.currentPageNumber.set(1);
    this.messagesPaginator()?.changePage(0);
  }

  protected onSelectionChange($event: (string | ReceivedMessage)[] | string) {
    if (typeof $event === 'string') {
      this.selection.set($event);
      return;
    }

    if ($event.some((e) => !e)) {
      return;
    }

    const selection = $event
      .map((e) => (typeof e === 'string' ? e : (e.sequence ?? '')))
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

  getField(data: unknown, field: string) {
    const fieldParts = field.split('.');
    let currentData = data;
    for (const part of fieldParts) {
      if (currentData === undefined || currentData === null) {
        return undefined;
      }
      if (typeof currentData !== 'object') {
        return undefined;
      }
      currentData = (currentData as Record<string, unknown>)[part];
    }
    return currentData;
  }

  protected readonly Date = Date;
}

export default MessagesViewer;
