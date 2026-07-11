import {
  ApplicationRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  messagePagesActions,
  messagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  of,
  startWith,
  switchMap,
  take,
} from 'rxjs';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { MessagePage } from '@service-bus-browser/messages-contracts';
import { BodyFilter, MessageFilter, PropertyFilter } from '@service-bus-browser/filtering';
import { FormsModule } from '@angular/forms';
import {
  SbbButton,
  SbbDialog,
  SbbMenu,
  SbbMenuItem,
  SbbPopover,
  SbbScrollPanel,
  SbbTooltip,
} from '@service-bus-browser/shared-ui';
import {
  faEllipsisVertical,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { ColorThemeService } from '@service-bus-browser/services';
import { BASE_ROUTE } from '../const';
import { EndpointSelectorTreeInputComponent } from '@service-bus-browser/topology-components';
import {
  PropertyValue,
  ReceivedMessage,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { MessageFilterEditorComponent } from '../message-filter-editor/message-filter-editor.component';
import { SystemPropertyForm } from '../message-filter-editor/system-property-form/system-property-form';
import { ApplicationPropertyForm } from '../message-filter-editor/application-property-form/application-property-form';
import { BodyPropertyForm } from '../message-filter-editor/body-property-form/body-property-form';
import { EditorContextAction } from '@service-bus-browser/shared-components';
import { hasActiveFilters as hasActiveFilterFunc } from '@service-bus-browser/filtering';
import { Actions } from '@ngrx/effects';
import { getMessagesRepository } from '@service-bus-browser/messages-db';

// FIRE_AND_FORGET_REPOSITORY: assigned in a microtask before NgRx effects run
let repository!: Awaited<ReturnType<typeof getMessagesRepository>>;
getMessagesRepository().then((r) => (repository = r));
import { UUID } from '@service-bus-browser/shared-contracts';
import MessagesViewer, { MessagesLazyLoad } from '../messages-viewer/messages-viewer';


@Component({
  selector: 'lib-messages-page',
  imports: [
    CommonModule,
    FormsModule,
    SbbDialog,
    SbbButton,
    SbbScrollPanel,
    EndpointSelectorTreeInputComponent,
    SbbMenu,
    MessageFilterEditorComponent,
    SbbTooltip,
    MessagesViewer,
    SbbPopover,
    SystemPropertyForm,
    ApplicationPropertyForm,
    BodyPropertyForm,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  router = inject(Router);
  baseRoute = inject(BASE_ROUTE);
  actions = inject(Actions);
  appRef = inject(ApplicationRef);

  resendAllMessages = model<boolean>(false);
  displayBodyFullscreen = model<boolean>(false);
  displaySendMessages = model<boolean>(false);
  displayFilterEditor = model<boolean>(false);
  sendEndpoint = model<SendEndpoint | null>(null);
  currentPage = signal<MessagePage | null>(null);
  menuMessagesSelection = signal<ReceivedMessage[]>([]);
  messageFilter = computed(() => {
    const currentPage = this.currentPage();
    return (
      currentPage?.filter ?? {
        headers: [],
        deliveryAnnotations: [],
        messageAnnotations: [],
        properties: [],
        applicationProperties: [],
        body: [],
      }
    );
  });
  virtualMessages = linkedSignal(() =>
    Array.from<ReceivedMessage>({
      length: this.filteredMessageCount() ?? 0,
    }),
  );

  selection = signal<string[]>([]);
  isLoading = signal(false);

  knownHeaders = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['pageId']),
      distinctUntilChanged(),
      switchMap((pageId) => {
        return from(repository.getHeaderPropertyLabels(pageId));
      }),
    ),
    { initialValue: [] },
  );
  knownProperties = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['pageId']),
      distinctUntilChanged(),
      switchMap((pageId) => {
        return from(repository.getPropertiesPropertyLabels(pageId));
      }),
    ),
    { initialValue: [] },
  );
  knownDeliveryAnnotations = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['pageId']),
      distinctUntilChanged(),
      switchMap((pageId) => {
        return from(repository.getDeliveryAnnotationsPropertyLabels(pageId));
      }),
    ),
    { initialValue: [] },
  );
  knownMessageAnnotations = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['pageId']),
      distinctUntilChanged(),
      switchMap((pageId) => {
        return from(repository.getMessageAnnotationsPropertyLabels(pageId));
      }),
    ),
    { initialValue: [] },
  );
  knownApplicationProperties = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['pageId']),
      distinctUntilChanged(),
      switchMap((pageId) => {
        return from(repository.getApplicationPropertyLabels(pageId));
      }),
    ),
    { initialValue: [] },
  );

  totalMessageCount = toSignal(
    toObservable(this.currentPage).pipe(
      map((page) => page?.id),
      distinctUntilChanged(),
      switchMap((pageId) => {
        if (!pageId) {
          return of(undefined);
        }
        return from(repository.countMessages(pageId)).pipe(
          startWith(undefined),
        );
      }),
    ),
  );
  filteredMessageCount = toSignal(
    combineLatest([
      toObservable(this.currentPage).pipe(map((page) => page?.id)),
      toObservable(this.messageFilter),
    ]).pipe(
      distinctUntilChanged(
        (previous, current) =>
          JSON.stringify(previous) === JSON.stringify(current),
      ),
      switchMap(([pageId, filter]) => {
        if (!pageId) {
          return of(undefined);
        }
        return from(repository.countMessages(pageId, filter)).pipe(
          startWith(undefined),
        );
      }),
    ),
    {
      initialValue: undefined,
    },
  );

  filteredPercentage = computed(() => {
    const total = this.totalMessageCount();
    const filtered = this.filteredMessageCount();

    if (total === undefined || filtered === undefined) {
      return undefined;
    }
    if (total === 0 || filtered === 0) {
      return 0;
    }

    return total ? (filtered / total) * 100 : 0;
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

  properties = computed<Array<{ key: string; value: PropertyValue }>>(() => {
    const currentPage = this.currentPage();
    const message = this.selectedMessage();
    if (!currentPage || !message) {
      return [];
    }

    return Object.entries(message.properties ?? {}).map(([key, value]) => {
      if (value instanceof Uint8Array) {
        return {
          key,
          value: new TextDecoder().decode(value),
        };
      }

      return { key, value: value as PropertyValue };
    });
  });

  propertiesContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);
  headersContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);
  deliveryAnnotationsContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);
  messageAnnotationsContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);
  applicationPropertiesContextMenuSelection = signal<
    { key: string; value: unknown } | undefined
  >(undefined);

  protected readonly faFilter = faFilter;
  protected readonly faEllipsisVertical = faEllipsisVertical;

  filterPopover = viewChild<SbbPopover>('filterPopover');
  currentFilterSection = signal<
    | 'headers'
    | 'properties'
    | 'deliveryAnnotations'
    | 'messageAnnotations'
    | 'applicationProperties'
    | 'body'
  >('properties');
  currentFilterDraft = signal<PropertyFilter>({
    isActive: true,
    fieldName: '',
    fieldType: 'string',
    filterType: 'equals',
    value: '',
  });
  currentBodyFilterDraft = signal<BodyFilter>({
    isActive: true,
    filterType: 'contains',
    value: '',
  });
  filterPopoverVisible = signal(false);

  protected bodyContextActions: EditorContextAction[] = [
    {
      id: 'add-body-contains-filter',
      label: 'Add body contains filter',
      run: (selectedText) => this.openDraftBodyFilterPopover(selectedText),
    },
  ];

  filterFormProperties = computed(() => {
    const section = this.currentFilterSection();
    const draft = this.currentFilterDraft();
    let known: { label: string; type: string }[] = [];
    switch (section) {
      case 'headers': known = [...this.knownHeaders()]; break;
      case 'properties': known = [...this.knownProperties()]; break;
      case 'deliveryAnnotations': known = [...this.knownDeliveryAnnotations()]; break;
      case 'messageAnnotations': known = [...this.knownMessageAnnotations()]; break;
      case 'applicationProperties': known = [...this.knownApplicationProperties()]; break;
    }
    if (draft.fieldName && !known.find((k) => k.label === draft.fieldName)) {
      known = [{ label: draft.fieldName, type: draft.fieldType }, ...known];
    }
    return known;
  });

  filterSectionLabel = computed(() => {
    switch (this.currentFilterSection()) {
      case 'headers': return 'Header';
      case 'properties': return 'Property';
      case 'deliveryAnnotations': return 'Delivery Annotation';
      case 'messageAnnotations': return 'Message Annotation';
      case 'applicationProperties': return 'Application Property';
      case 'body': return 'Body';
    }
  });

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private lastContextMenuPosition: { x: number; y: number } | undefined;
  private filterPopoverAnchorEl: HTMLElement | undefined;

  headersContextMenu = computed(() => {
    let selection = this.headersContextMenuSelection();
    if (!selection) {
      selection = { key: 'durable', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        onSelect: () => {
          this.filterOnHeader(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });
  propertiesContextMenu = computed(() => {
    let selection = this.propertiesContextMenuSelection();
    if (!selection) {
      selection = { key: 'subject', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        onSelect: () => {
          this.filterOnProperty(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });
  deliveryAnnotationsContextMenu = computed(() => {
    let selection = this.deliveryAnnotationsContextMenuSelection();
    if (!selection) {
      selection = { key: 'x-opt-enqueued-time', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        onSelect: () => {
          this.filterOnDeliveryAnnotation(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });
  messageAnnotationsContextMenu = computed(() => {
    let selection = this.messageAnnotationsContextMenuSelection();
    if (!selection) {
      selection = { key: 'x-opt-sequence-number', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        onSelect: () => {
          this.filterOnMessageAnnotation(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });
  applicationPropertiesContextMenu = computed(() => {
    let selection = this.applicationPropertiesContextMenuSelection();
    if (!selection) {
      selection = { key: 'contentType', value: '' };
    }

    return [
      {
        label: 'Copy property',
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(`${selection.key}: ${selection.value}`);
        },
      },
      {
        label: "Copy property's value",
        icon: 'pi pi-copy',
        onSelect: () => {
          navigator.clipboard.writeText(selection.value as string);
        },
      },
      {
        label: `Add filter for ${selection.key}`,
        icon: 'pi pi-filter',
        onSelect: () => {
          this.filterOnApplicationProperty(
            selection.key,
            selection.value as string | number | boolean | Date,
          );
        },
      },
    ];
  });

  colorThemeService = inject(ColorThemeService);

  messageContextMenu = computed<SbbMenuItem<ReceivedMessage>[]>(() => {
    const contextMenuSelection = this.selection();
    return this.getMenuItems(contextMenuSelection, false);
  });

  allMessagesMenu = computed<SbbMenuItem<ReceivedMessage>[]>(() => {
    return this.getMenuItems(undefined, true);
  });

  constructor() {
    const onContextMenu = (event: MouseEvent) => {
      this.lastContextMenuPosition = { x: event.clientX, y: event.clientY };
    };
    this.document.addEventListener('contextmenu', onContextMenu, true);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('contextmenu', onContextMenu, true);
      this.removeFilterPopoverAnchor();
    });

    this.activatedRoute.params
      .pipe(
        map((params) => params['pageId']),
        distinctUntilChanged(),
        switchMap((pageId) => {
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

    this.activatedRoute.params
      .pipe(
        map((params) => params['pageId']),
        distinctUntilChanged(),
        switchMap((pageId) => {
          // we only need to load the selection if the page first loads.
          // otherwise, this state is maintained in the component itself
          return this.store
            .select(MessagesSelectors.selectPageSelection(pageId))
            .pipe(take(1));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((selection) => {
        this.selection.set(selection);
      });
  }

  getMenuItems(
    menuSelection: string | string[] | undefined,
    allMessages: boolean,
  ) {
    if (!menuSelection && !allMessages) {
      return [];
    }

    if (
      !allMessages &&
      Array.isArray(menuSelection) &&
      menuSelection.length === 0
    ) {
      return [];
    }

    if (
      allMessages ||
      (Array.isArray(menuSelection) && menuSelection.length > 1)
    ) {
      return [
        {
          label: allMessages
            ? 'Quick resend all messages'
            : 'Quick selected resend messages',
          icon: 'pi pi-envelope',
          onSelect: () => {
            this.resendAllMessages.set(allMessages);
            this.displaySendMessages.set(true);
          },
        },
        {
          label: allMessages
            ? 'Batch resend all messages'
            : 'Batch resend selected messages',
          icon: 'pi pi-envelope',
          onSelect: () => {
            this.router.navigate(
              [this.baseRoute, 'batch-resend', this.currentPage()!.id],
              {
                state: {
                  selection: allMessages ? undefined : menuSelection,
                  filter: this.messageFilter(),
                },
              },
            );
          },
        },
        {
          label: allMessages ? 'Export all messages' : 'Export selection',
          icon: 'pi pi-download',
          onSelect: () => {
            this.exportMessages(allMessages);
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
        onSelect: () => {
          this.menuMessagesSelection.set([]);
          this.displaySendMessages.set(true);
        },
      },
      {
        label: allMessages ? 'Resend message' : 'Resend selected message',
        icon: 'pi pi-envelope',
        onSelect: () => {
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
        onSelect: () => {
          this.exportMessages(allMessages);
        },
      },
    ];
  }

  sendMessages() {
    const selection = this.selection();
    const endpoint = this.sendEndpoint();
    const sendAllMessages = this.resendAllMessages();

    if (
      !endpoint ||
      (!sendAllMessages &&
        !(selection && Array.isArray(selection) && selection.length > 0))
    ) {
      console.error('Invalid endpoint or messages', {
        selection,
        endpoint,
        sendAllMessages,
      });
      return;
    }

    this.displaySendMessages.set(false);
    this.store.dispatch(
      messagePagesActions.resendMessages({
        pageId: this.currentPage()!.id,
        messageFilter: this.messageFilter(),
        selectionKeys: sendAllMessages ? undefined : selection,
        endpoint: endpoint,
        modificationActions: [],
      }),
    );
  }

  exportMessages(allMessages: boolean) {
    const currentPage = this.currentPage();
    if (!currentPage) {
      return;
    }

    this.store.dispatch(
      messagePagesActions.exportMessages({
        pageId: currentPage.id,
        filter: this.messageFilter(),
        selectionKeys: allMessages ? undefined : this.selection(),
      }),
    );
  }

  openFilterDialog() {
    this.displayFilterEditor.set(true);
  }

  onFiltersUpdated(filter: MessageFilter) {
    this.selection.set([]);
    this.virtualMessages.set([]);

    this.store.dispatch(
      messagePagesActions.setPageFilter({
        pageId: this.currentPage()!.id,
        filter: filter,
      }),
    );
  }

  protected filterOnProperty(key: string, value: string | number | boolean | Date) {
    this.openDraftFilterPopover(key, value, 'properties');
  }

  protected filterOnHeader(key: string, value: string | number | boolean | Date) {
    this.openDraftFilterPopover(key, value, 'headers');
  }

  protected filterOnDeliveryAnnotation(key: string, value: string | number | boolean | Date) {
    this.openDraftFilterPopover(key, value, 'deliveryAnnotations');
  }

  protected filterOnMessageAnnotation(key: string, value: string | number | boolean | Date) {
    this.openDraftFilterPopover(key, value, 'messageAnnotations');
  }

  protected filterOnApplicationProperty(key: string, value: string | number | boolean | Date) {
    this.openDraftFilterPopover(key, value, 'applicationProperties');
  }

  openDraftBodyFilterPopover(selectedText: string): void {
    this.currentFilterSection.set('body');
    this.currentBodyFilterDraft.set({
      isActive: true,
      filterType: 'contains',
      value: selectedText,
    });
    this.filterPopoverVisible.set(true);
    this.showDraftFilterPopover();
  }

  private openDraftFilterPopover(
    key: string,
    value: string | number | boolean | Date,
    section: 'headers' | 'properties' | 'deliveryAnnotations' | 'messageAnnotations' | 'applicationProperties',
  ) {
    this.currentFilterSection.set(section);
    this.currentFilterDraft.set({
      fieldName: key,
      filterType: 'equals',
      value: value,
      fieldType: this.toFilterPropertyType(key, value),
      isActive: true,
    } as PropertyFilter);
    this.filterPopoverVisible.set(true);
    this.showDraftFilterPopover();
  }

  private showDraftFilterPopover(): void {
    this.removeFilterPopoverAnchor();
    const position = this.lastContextMenuPosition;
    const view = this.document.defaultView;

    const anchor = this.document.createElement('div');
    anchor.style.position = 'fixed';
    anchor.style.left = `${position?.x ?? (view?.innerWidth ?? 0) / 2}px`;
    anchor.style.top = `${position?.y ?? (view?.innerHeight ?? 0) / 2}px`;
    anchor.style.width = '1px';
    anchor.style.height = '1px';
    anchor.style.pointerEvents = 'none';
    this.document.body.appendChild(anchor);
    this.filterPopoverAnchorEl = anchor;
    this.filterPopover()?.open(anchor);
  }

  private removeFilterPopoverAnchor(): void {
    this.filterPopoverAnchorEl?.remove();
    this.filterPopoverAnchorEl = undefined;
  }

  saveFilterPopover(): void {
    const section = this.currentFilterSection();
    const currentFilter = this.messageFilter();

    if (section === 'body') {
      this.onFiltersUpdated({
        ...currentFilter,
        body: [...currentFilter.body, this.currentBodyFilterDraft()],
      });
    } else {
      this.onFiltersUpdated({
        ...currentFilter,
        [section]: [...currentFilter[section], this.currentFilterDraft()],
      });
    }

    this.filterPopover()?.close();
  }

  cancelFilterPopover(): void {
    this.filterPopover()?.close();
  }

  onFilterPopoverHide(): void {
    this.removeFilterPopoverAnchor();
    this.filterPopoverVisible.set(false);
  }

  private toFilterPropertyType(
    key: string,
    value: string | number | boolean | Date,
  ): 'date' | 'timespan' | 'string' | 'number' | 'boolean' {
    if (value instanceof Date) {
      return 'date';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (key === 'ttl') {
      return 'timespan';
    }

    return 'string';
  }

  protected async loadMessages($event: MessagesLazyLoad) {
    const first = $event.first ?? 0;
    const rows = $event.rows ?? 0;

    await this.loadRows(first, rows, this.currentPage()!.id);
  }

  private async loadRows(first: number, rows: number, pageId: UUID) {
    this.isLoading.set(true);
    const messages = await repository.getMessages(
      pageId,
      this.messageFilter(),
      first,
      rows,
    );

    this.virtualMessages.update((vm) => {
      const newMessages = [
        ...vm.slice(0, first),
        ...messages.slice(0, rows),
        ...vm.slice(first + rows, vm.length),
      ];

      return newMessages;
    });
    this.isLoading.set(false);
  }

  protected onSelectionChange($event: string[] | string | undefined) {
    if (!$event) {
      this.store.dispatch(
        messagePagesActions.setPageSelection({
          pageId: this.currentPage()!.id,
          selectionKeys: [],
        }),
      );
      return;
    }

    this.store.dispatch(
      messagePagesActions.setPageSelection({
        pageId: this.currentPage()!.id,
        selectionKeys: typeof $event === 'string' ? [$event] : $event,
      }),
    );
    this.appRef.tick();
  }
}
