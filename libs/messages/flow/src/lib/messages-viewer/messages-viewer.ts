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
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UUID } from '@service-bus-browser/shared-contracts';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, from, startWith, switchMap } from 'rxjs';
import { getMessagesRepository } from '@service-bus-browser/messages-db';

// FIRE_AND_FORGET_REPOSITORY: assigned in a microtask before NgRx effects run
let repository!: Awaited<ReturnType<typeof getMessagesRepository>>;
getMessagesRepository().then((r) => (repository = r));
import { BodyViewer } from '../body-viewer/body-viewer';
import { EditorContextAction } from '@service-bus-browser/shared-components';
import { MessageModificationAction } from '@service-bus-browser/message-modification-engine';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import {
  SbbButton,
  SbbColumn,
  SbbContextMenu,
  SbbDataGrid,
  SbbLazyLoadEvent,
  SbbMenuItem,
  SbbPopover,
  SbbReorderableList,
  SbbReorderableListHandle,
  SbbReorderableListItemDef,
  SbbReorderableListReorderEvent,
  SbbScrollPanel,
  SbbSelect,
  SbbSelectOptionGroup,
  SbbSplitter,
  SbbSplitterPanel,
  SbbTooltip,
} from '@service-bus-browser/shared-ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faPlus,
  faTableCells,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/** Lazy-load window requested by the viewer (absolute row indices). */
export interface MessagesLazyLoad {
  first: number;
  last: number;
  rows: number;
}

@Component({
  selector: 'lib-messages-viewer',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    DatePipe,
    BodyViewer,
    SbbDataGrid,
    SbbContextMenu,
    SbbSplitter,
    SbbSplitterPanel,
    SbbScrollPanel,
    SbbPopover,
    SbbSelect,
    SbbButton,
    SbbTooltip,
    FaIconComponent,
    SbbReorderableList,
    SbbReorderableListItemDef,
    SbbReorderableListHandle,
  ],
  templateUrl: './messages-viewer.html',
  styleUrl: './messages-viewer.scss',
})
class MessagesViewer implements AfterViewInit, OnDestroy {
  protected cdRef = inject(ChangeDetectorRef);
  protected resizeObserver?: ResizeObserver;
  private rangeAnchorIndex: number | null = null;
  protected pendingRange = signal<{ from: number; to: number } | null>(null);

  protected readonly faTableCells = faTableCells;
  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;
  protected readonly faBars = faBars;

  protected showTableLoading = computed(
    () => this.isLoading() || this.pendingRange() !== null,
  );

  // template references
  messagesHeader = contentChild('messagesHeader', { read: TemplateRef });
  messagesHeaderStatus = contentChild('messagesHeaderStatus', { read: TemplateRef });
  messagesHeaderActions = contentChild('messagesHeaderActions', { read: TemplateRef });
  messagesGrid = viewChild<SbbDataGrid<ReceivedMessage>>('messagesGrid');
  container = viewChild.required('container', { read: ElementRef });

  // inputs
  lazy = input<boolean>(false);
  multiselect = input<boolean>(false);
  isLoading = input<boolean>(false);

  pageId = input.required<UUID>();
  messagesContextMenu = input<SbbMenuItem<ReceivedMessage>[]>([]);
  applicationPropertiesContextMenu = input<SbbMenuItem<PropertyRow>[]>([]);
  headersContextMenu = input<SbbMenuItem<PropertyRow>[]>([]);
  propertiesContextMenu = input<SbbMenuItem<PropertyRow>[]>([]);
  deliveryAnnotationsContextMenu = input<SbbMenuItem<PropertyRow>[]>([]);
  messageAnnotationsContextMenu = input<SbbMenuItem<PropertyRow>[]>([]);

  messages = input.required<ReceivedMessage[]>();
  bodyContextActions = input<EditorContextAction[]>([]);
  bodyModificationActions = input<MessageModificationAction[]>([]);
  sessionActionsKey = input<string | undefined>(undefined);
  // Hide the sections cleared on resend (headers, delivery/message annotations)
  // so the sidebar only shows what is actually sent.
  sendMode = input<boolean>(false);
  // Force the stacked (narrow) layout regardless of available width.
  forceNarrow = input<boolean>(false);
  containerWidth = signal<number>(0);

  selection = model<string | string[]>();
  headersContextMenuSelection = model<PropertyRow | undefined>(undefined);
  propertiesContextMenuSelection = model<PropertyRow | undefined>(undefined);
  deliveryAnnotationsContextMenuSelection = model<PropertyRow | undefined>(undefined);
  messageAnnotationsContextMenuSelection = model<PropertyRow | undefined>(undefined);
  applicationPropertiesContextMenuSelection = model<PropertyRow | undefined>(undefined);
  isResizing = signal(false);

  lazyLoadTriggered = output<MessagesLazyLoad>();

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

  /** Selected message keys as a plain array (empty when nothing selected). */
  protected selectionKeys = computed<string[]>(() => {
    const selection = this.selection();
    if (selection === undefined || selection === null) {
      return [];
    }
    return Array.isArray(selection) ? selection : [selection];
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

  selectedMessageKey = computed(() => {
    const selection = this.selection();
    if (Array.isArray(selection)) {
      return selection[0];
    }
    return selection;
  });

  headers = computed<PropertyRow[]>(() => {
    const headers = this.selectedMessage()?.headers;

    if (!headers) {
      return [];
    }

    return Object.entries(headers).map(([key, value]) => ({ key, value }));
  });
  properties = computed<PropertyRow[]>(() => {
    const properties = this.selectedMessage()?.properties;

    if (!properties) {
      return [];
    }

    return Object.entries(properties).map(([key, value]) => ({ key, value }));
  });
  deliveryAnnotations = computed<PropertyRow[]>(() => {
    const deliveryAnnotations = this.selectedMessage()?.deliveryAnnotations;

    if (!deliveryAnnotations) {
      return [];
    }

    return Object.entries(deliveryAnnotations).map(([key, value]) => ({ key, value }));
  });
  messageAnnotations = computed<PropertyRow[]>(() => {
    const messageAnnotations = this.selectedMessage()?.messageAnnotations;

    if (!messageAnnotations) {
      return [];
    }

    return Object.entries(messageAnnotations).map(([key, value]) => ({ key, value }));
  });
  applicationProperties = computed<PropertyRow[]>(() => {
    const applicationProperties = this.selectedMessage()?.applicationProperties;

    if (!applicationProperties) {
      return [];
    }

    return Object.entries(applicationProperties).map(([key, value]) => ({ key, value }));
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

  /** Column defs consumed by the data grid. */
  gridColumns = computed<SbbColumn<ReceivedMessage>[]>(() =>
    this.cols().map((col) => ({
      field: col.field,
      header: col.header,
      sortable: false,
      width: '20%',
      value: (row: ReceivedMessage) => this.getField(row, col.field),
    })),
  );

  propertiesCols = [
    { field: 'label', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  canAddColumn = computed(() => {
    const used = new Set(this.selectedColumnFields());
    return this.availableColumnGroups().some((g) =>
      g.items.some((it) => !used.has(it.field)),
    );
  });

  /** Grouped select options for the column picker row at `index`. */
  columnOptionsForRow(index: number): SbbSelectOptionGroup<string>[] {
    const fields = this.selectedColumnFields();
    const currentField = fields[index];
    const usedElsewhere = new Set(fields.filter((_, i) => i !== index));
    return this.availableColumnGroups()
      .map((g) => ({
        label: g.label,
        options: g.items
          .filter(
            (it) => it.field === currentField || !usedElsewhere.has(it.field),
          )
          .map((it) => ({ label: it.header, value: it.field })),
      }))
      .filter((g) => g.options.length > 0);
  }

  protected addColumn() {
    const used = new Set(this.selectedColumnFields());
    for (const group of this.availableColumnGroups()) {
      for (const item of group.items) {
        if (!used.has(item.field)) {
          this.selectedColumnFields.update((f) => [...f, item.field]);
          return;
        }
      }
    }
  }

  protected removeColumn(index: number) {
    this.selectedColumnFields.update((f) =>
      f.filter((_, i) => i !== index),
    );
  }

  protected setColumn(index: number, field: string) {
    if (!field) {
      return;
    }
    this.selectedColumnFields.update((f) =>
      f.map((v, i) => (i === index ? field : v)),
    );
  }

  protected dropColumn(event: SbbReorderableListReorderEvent) {
    const { previousIndex, currentIndex } = event;
    this.selectedColumnFields.update((f) => {
      const arr = [...f];
      const [moved] = arr.splice(previousIndex, 1);
      arr.splice(currentIndex, 0, moved);
      return arr;
    });
  }

  protected readonly trackByKey = (row: ReceivedMessage, index: number) =>
    row?.key ?? index;

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
    this.messagesGrid()?.resetLazyState();
    this.messagesGrid()?.scrollToIndex(0);
  }

  /** Single-select mode: reflect the grid's own selection back into the model. */
  protected onGridSelectionChange(ids: readonly unknown[]) {
    if (this.multiselect()) {
      return;
    }
    this.selection.set((ids[0] as string) ?? undefined);
  }

  protected onGridRowMouseDown(payload: {
    event: MouseEvent;
    row: ReceivedMessage | null;
    index: number;
  }) {
    if (payload.event.shiftKey && this.multiselect()) {
      // Avoid the browser's native text selection during a shift-range drag.
      payload.event.preventDefault();
    }
  }

  protected onGridRowClick(payload: {
    event: MouseEvent;
    row: ReceivedMessage | null;
    index: number;
  }) {
    if (!this.multiselect()) {
      // Single-select is handled by the grid's own selection + selectionChange.
      return;
    }

    const { event, row, index } = payload;
    const absoluteIndex = index;

    if (event.shiftKey && this.rangeAnchorIndex !== null) {
      event.preventDefault();
      event.stopPropagation();
      const fromIdx = Math.min(this.rangeAnchorIndex, absoluteIndex);
      const toIdx = Math.max(this.rangeAnchorIndex, absoluteIndex);
      this.startRangeSelection(fromIdx, toIdx);
      return;
    }

    this.rangeAnchorIndex = absoluteIndex;
    const key = row?.key;
    if (!key) {
      return;
    }

    const current = this.selectionKeys();
    if (event.ctrlKey || event.metaKey) {
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      this.selection.set(next);
    } else {
      this.selection.set([key]);
    }
  }

  /** Right-click on a message row: join it to the selection, then open menu. */
  protected onMessageContextMenu(row: ReceivedMessage) {
    if (!row?.key) {
      return;
    }
    if (this.multiselect()) {
      const current = this.selectionKeys();
      if (!current.includes(row.key)) {
        this.selection.set([...current, row.key]);
      }
    } else {
      this.selection.set(row.key);
    }
  }

  private startRangeSelection(absoluteFrom: number, absoluteTo: number) {
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

    // Mark multiselect as ongoing; the constructor effect will finalize the
    // selection as soon as messages() reports every row in the range as loaded.
    this.pendingRange.set({ from: absoluteFrom, to: absoluteTo });

    this.lazyLoadTriggered.emit({
      first: absoluteFrom,
      last: absoluteTo + 1,
      rows: absoluteTo - absoluteFrom + 1,
    });
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

    this.pendingRange.set(null);
    this.selection.set(keys);
    this.cdRef.detectChanges();
  }

  protected onGridLazyLoad($event: SbbLazyLoadEvent) {
    this.lazyLoadTriggered.emit({
      first: $event.first,
      last: $event.last,
      rows: $event.rows,
    });
  }

  protected dateGuard(value: unknown): value is Date {
    return value instanceof Date;
  }

  protected onResize() {
    this.cdRef.detectChanges();
  }

  protected toggleColumnPicker(popover: SbbPopover, event: Event) {
    popover.toggle(event.currentTarget as HTMLElement);
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

/** Key/value row shown in the message property side tables. */
interface PropertyRow {
  key: string;
  value: unknown;
}

export default MessagesViewer;
