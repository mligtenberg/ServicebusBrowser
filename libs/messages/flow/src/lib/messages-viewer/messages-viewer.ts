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
  untracked,
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
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BodyViewer } from '../body-viewer/body-viewer';
import { Splitter } from 'primeng/splitter';
import { ScrollPanel } from 'primeng/scrollpanel';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import { Popover } from 'primeng/popover';
import { Listbox } from 'primeng/listbox';
import { Button } from 'primeng/button';

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
    Popover,
    Listbox,
    Button,
  ],
  templateUrl: './messages-viewer.html',
  styleUrl: './messages-viewer.scss',
})
class MessagesViewer implements AfterViewInit, OnDestroy {
  protected cdRef = inject(ChangeDetectorRef);
  protected resizeObserver?: ResizeObserver;
  private rangeAnchorIndex: number | null = null;
  protected pendingRange = signal<{ from: number; to: number } | null>(null);
  private suppressIncomingSelectionChange = false;

  protected showTableLoading = computed(
    () => this.isLoading() || this.pendingRange() !== null,
  );

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
  headersContextMenu = input<MenuItem[]>([]);
  propertiesContextMenu = input<MenuItem[]>([]);
  deliveryAnnotationsContextMenu = input<MenuItem[]>([]);
  messageAnnotationsContextMenu = input<MenuItem[]>([]);

  messages = input.required<ReceivedMessage[]>();
  maxMessagesPerPage = input<number>(100000);
  containerWidth = signal<number>(0);

  selection = model<string | string[]>();
  headersContextMenuSelection = model<
    { key: string; value: unknown } | undefined
  >(undefined);
  propertiesContextMenuSelection = model<
    { key: string; value: unknown } | undefined
  >(undefined);
  deliveryAnnotationsContextMenuSelection = model<
    { key: string; value: unknown } | undefined
  >(undefined);
  messageAnnotationsContextMenuSelection = model<
    { key: string; value: unknown } | undefined
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
  showHeadersContextMenu = computed(() => this.headersContextMenu().length > 0);
  showPropertiesContextMenu = computed(
    () => this.propertiesContextMenu().length > 0,
  );
  showDeliveryAnnotationsContextMenu = computed(
    () => this.deliveryAnnotationsContextMenu().length > 0,
  );
  showMessageAnnotationsContextMenu = computed(
    () => this.messageAnnotationsContextMenu().length > 0,
  );

  body = computed(() => {
    const message = this.selectedMessage();
    if (!message) {
      return '';
    }

    return new TextDecoder().decode(message.body);
  });

  headers = computed<Array<{ key: string; value: unknown }>>(() => {
    const headers = this.selectedMessage()?.headers;

    if (!headers) {
      return [];
    }

    return Object.entries(headers).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  });
  properties = computed<Array<{ key: string; value: unknown }>>(() => {
    const properties = this.selectedMessage()?.properties;

    if (!properties) {
      return [];
    }

    return Object.entries(properties).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  });
  deliveryAnnotations = computed<Array<{ key: string; value: unknown }>>(() => {
    const deliveryAnnotations = this.selectedMessage()?.deliveryAnnotations;

    if (!deliveryAnnotations) {
      return [];
    }

    return Object.entries(deliveryAnnotations).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  });
  messageAnnotations = computed<Array<{ key: string; value: unknown }>>(() => {
    const messageAnnotations = this.selectedMessage()?.messageAnnotations;

    if (!messageAnnotations) {
      return [];
    }

    return Object.entries(messageAnnotations).map(([key, value]) => ({
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
  static readonly DEFAULT_COLUMN_FIELDS = [
    'sequence',
    'messageId',
    'properties.subject',
  ];
  static readonly SYSTEM_COLUMNS: { field: string; header: string }[] = [
    { field: 'sequence', header: 'Sequence' },
    { field: 'messageId', header: 'Id' },
    { field: 'contentType', header: 'Content type' },
  ];

  selectedColumnFields = signal<string[]>(
    MessagesViewer.DEFAULT_COLUMN_FIELDS,
  );
  private columnsHydrated = signal(false);

  private propertyLabelsTrigger = toSignal(
    toObservable(this.pageId).pipe(
      switchMap((pageId) =>
        from(
          Promise.all([
            repository.getHeaderPropertyLabels(pageId),
            repository.getPropertiesPropertyLabels(pageId),
            repository.getDeliveryAnnotationsPropertyLabels(pageId),
            repository.getMessageAnnotationsPropertyLabels(pageId),
            repository.getApplicationPropertyLabels(pageId),
          ]),
        ).pipe(startWith(undefined)),
      ),
    ),
    { initialValue: undefined },
  );

  availableColumnGroups = computed(() => {
    const labels = this.propertyLabelsTrigger();
    const [headers, properties, deliveryAnnotations, messageAnnotations, applicationProperties] =
      labels ?? [[], [], [], [], []];

    const toItems = (
      prefix: string,
      list: { label: string; type: string }[],
    ) =>
      list.map((l) => ({
        field: `${prefix}.${l.label}`,
        header: l.label,
      }));

    return [
      { label: 'System', items: MessagesViewer.SYSTEM_COLUMNS },
      { label: 'Headers', items: toItems('headers', headers) },
      { label: 'Properties', items: toItems('properties', properties) },
      {
        label: 'Delivery annotations',
        items: toItems('deliveryAnnotations', deliveryAnnotations),
      },
      {
        label: 'Message annotations',
        items: toItems('messageAnnotations', messageAnnotations),
      },
      {
        label: 'Application properties',
        items: toItems('applicationProperties', applicationProperties),
      },
    ].filter((g) => g.items.length > 0);
  });

  cols = computed(() => {
    const fields = this.selectedColumnFields();
    const allItems = this.availableColumnGroups().flatMap((g) => g.items);
    const lookup = new Map(allItems.map((c) => [c.field, c]));
    return fields
      .map((field) => lookup.get(field))
      .filter((col): col is { field: string; header: string } => !!col);
  });

  propertiesCols = [
    { field: 'label', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  constructor() {
    effect((onCleanup) => {
      const pageId = this.pageId();
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      this.columnsHydrated.set(false);
      repository.getVisibleColumns(pageId).then((stored) => {
        if (cancelled) return;
        untracked(() => {
          this.selectedColumnFields.set(
            stored ?? MessagesViewer.DEFAULT_COLUMN_FIELDS,
          );
          this.columnsHydrated.set(true);
        });
      });
    });

    effect(() => {
      const fields = this.selectedColumnFields();
      if (!this.columnsHydrated()) {
        return;
      }
      const pageId = untracked(() => this.pageId());
      repository.setVisibleColumns(pageId, fields).catch(() => {
        // ignore persistence errors
      });
    });

    effect(() => {
      this.currentPageNumber();
      this.messagesTable().reset();
    });

    // Finalize a pending range selection once the table data has been
    // updated and every row in the range is loaded.
    effect(() => {
      const msgs = this.messages();
      const pending = this.pendingRange();
      if (!pending) {
        return;
      }

      for (let i = pending.from; i <= pending.to; i++) {
        if (!msgs[i]) {
          return;
        }
      }

      untracked(() => this.finalizeRangeSelection(pending.from, pending.to, msgs));
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
    if (this.pendingRange() !== null || this.suppressIncomingSelectionChange) {
      return;
    }

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

  protected onRowMouseDown(event: MouseEvent) {
    if (event.shiftKey && this.multiselect()) {
      event.preventDefault();
      // Set BEFORE PrimeNG's click handler runs so its synchronous
      // selectionChange (which only sees the currently rendered subset of the
      // range) gets ignored.
      this.suppressIncomingSelectionChange = true;
    }
  }

  protected onRowClick(event: MouseEvent, rowIndex: number) {
    if (!this.multiselect()) {
      this.suppressIncomingSelectionChange = false;
      return;
    }

    const offset =
      (this.currentPageNumber() - 1) * this.maxMessagesPerPage();
    const absoluteIndex = offset + rowIndex;

    if (!event.shiftKey) {
      this.rangeAnchorIndex = absoluteIndex;
      this.suppressIncomingSelectionChange = false;
      return;
    }

    if (this.rangeAnchorIndex === null) {
      this.rangeAnchorIndex = absoluteIndex;
      this.suppressIncomingSelectionChange = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const fromIdx = Math.min(this.rangeAnchorIndex, absoluteIndex);
    const toIdx = Math.max(this.rangeAnchorIndex, absoluteIndex);
    this.startRangeSelection(fromIdx, toIdx);
  }

  private startRangeSelection(absoluteFrom: number, absoluteTo: number) {
    // Hand off from click-event suppression to the long-lived pendingRange
    // flag (used as the "multiselect ongoing" indicator).
    this.suppressIncomingSelectionChange = false;

    const messages = this.messages();
    let needsLoad = false;
    for (let i = absoluteFrom; i <= absoluteTo; i++) {
      if (!messages[i]) {
        needsLoad = true;
        break;
      }
    }

    if (!needsLoad) {
      // All rows already loaded — finalize immediately.
      this.finalizeRangeSelection(absoluteFrom, absoluteTo, messages);
      return;
    }

    // Mark multiselect as ongoing so any selectionChange events triggered by
    // the upcoming table refresh are ignored. The constructor effect will
    // finalize the selection as soon as messages() reports every row in the
    // range as loaded.
    this.pendingRange.set({ from: absoluteFrom, to: absoluteTo });

    this.lazyLoadTriggered.emit({
      first: absoluteFrom,
      last: absoluteTo + 1,
      rows: absoluteTo - absoluteFrom + 1,
    } as TableLazyLoadEvent);
  }

  private finalizeRangeSelection(
    from: number,
    to: number,
    messages: ReceivedMessage[],
  ) {
    const keys: string[] = [];
    for (let i = from; i <= to; i++) {
      const m = messages[i];
      if (m?.key) {
        keys.push(m.key);
      }
    }

    // Clear the flag before we set the selection so the resulting model
    // emission is allowed through onSelectionChange downstream paths.
    this.pendingRange.set(null);
    this.selection.set(keys);
    this.cdRef.detectChanges();
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
