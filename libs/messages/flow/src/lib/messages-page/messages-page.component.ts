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
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-messages-page',
  imports: [CommonModule, Card, TableModule, EditorComponent, FormsModule],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);

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
  properties = computed<Array<{key: string, value: unknown}>>(() => {
    const currentPage = this.currentPage();
    const message = this.selectedMessage();
    if (!currentPage || !message) {
      return [];
    }

    return [
      { key: 'contentType', value: message.contentType },
      { key: 'correlationId', value: message.correlationId },
      { key: 'enqueueSequenceNumber', value: message.enqueuedSequenceNumber },
      { key: 'enqueueTimeUtc', value: message.enqueuedTimeUtc },
      { key: 'messageId', value: message.messageId },
      { key: 'sequenceNumber', value: message.sequenceNumber },
      { key: 'subject', value: message.subject },
      { key: 'timeToLive', value: message.timeToLive },
      { key: 'to', value: message.to },
    ]
  });
  customProperties = computed(() => {
    const applicationProperties = this.selectedMessage()?.applicationProperties;

    if (!applicationProperties) {
      return [];
    }

    return Object.entries(applicationProperties)
      .map(([key, value]) => ({ key, value }));
  });

  cols = [
    { field: 'sequenceNumber', header: 'Sequence Number' },
    { field: 'messageId', header: 'Id' },
    { field: 'subject', header: 'Subject' },
  ];
  propertiesCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ]
  editorOptions = computed<unknown>(() => ({
    theme: 'vs-light',
    language: this.selectedMessage()?.contentType ?? 'text/plain',
    readOnly: true,
  }));

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
