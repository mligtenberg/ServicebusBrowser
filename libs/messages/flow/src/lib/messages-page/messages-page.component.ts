import { Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MessagesSelectors } from '@service-bus-browser/messages-store';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessagePage, ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  selector: 'lib-messages-page',
  imports: [
    CommonModule,
    Card,
    TableModule,
    FormsModule,
    Dialog,
    Button,
    EditorComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  displayBodyFullscreen = model<boolean>(false);

  currentPage = signal<MessagePage | null>(null);
  selectedMessage = model<ServiceBusReceivedMessage | undefined>(undefined);
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

    if (
      contentType.includes('yaml') ||
      contentType.includes('yml')
    ) {
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
      enabled: false
    }
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

  constructor() {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          const pageId: string = params['pageId'];
          this.selectedMessage.set(undefined);
          return this.store.select(MessagesSelectors.selectPage(pageId));
        }),
        takeUntilDestroyed()
      )
      .subscribe((page) => {
        this.currentPage.set(page ?? null);
      });
  }
}
