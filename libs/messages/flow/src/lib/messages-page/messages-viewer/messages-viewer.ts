import {
  ApplicationRef,
  Component,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ContextMenu } from 'primeng/contextmenu';
import { NgTemplateOutlet } from '@angular/common';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
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
import { Tooltip } from 'primeng/tooltip';

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
    Tooltip,
  ],
  templateUrl: './messages-viewer.html',
  styleUrl: './messages-viewer.scss',
})
export class MessagesViewer {
  appRef = inject(ApplicationRef);
  colorThemeService = inject(ColorThemeService);

  // template references
  messagesHeader = contentChild('messagesHeader', { read: TemplateRef });

  // inputs
  lazy = input<boolean>(false);
  multiselect = input<boolean>(false);

  pageId = input.required<UUID>();
  messagesContextMenu = input<MenuItem[]>([]);
  applicationPropertiesContextMenu = input<MenuItem[]>([]);
  systemPropertiesContextMenu = input<MenuItem[]>([]);

  messages = input.required<ServiceBusReceivedMessage[]>();

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
    this.appRef.tick();
  }

  protected onLazyLoad($event: TableLazyLoadEvent) {
    this.lazyLoadTriggered?.emit($event);
  }
}
