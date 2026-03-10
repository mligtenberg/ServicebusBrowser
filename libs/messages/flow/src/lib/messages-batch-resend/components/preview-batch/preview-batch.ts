import {
  Component,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import MessagesViewer from '../../../messages-viewer/messages-viewer';
import { UUID } from '@service-bus-browser/shared-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { MessageFilter } from '@service-bus-browser/filtering';
import {
  MessageModificationAction,
  MessageModificationEngine,
} from '@service-bus-browser/message-modification-engine';
import {
  Message,
  ReceivedMessage,
  ToMessageToSend,
} from '@service-bus-browser/api-contracts';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-preview-batch',
  imports: [MessagesViewer],
  templateUrl: './preview-batch.html',
  styleUrl: './preview-batch.scss',
})
export class PreviewBatch {
  private messageModificationEngine = inject(MessageModificationEngine);

  pageId = input.required<UUID>();
  messageFilter = input<MessageFilter>();
  selection = input<string[]>();
  batchModificationActions = input<MessageModificationAction[]>();
  selectedMessageSequence = model<string>();

  messageCount = toSignal(
    combineLatest([
      toObservable(this.pageId),
      toObservable(this.messageFilter),
      toObservable(this.selection),
    ]).pipe(
      switchMap(([pageId, messageFilter, selection]) =>
        repository.countMessages(pageId, messageFilter, selection),
      ),
    ),
  );

  messages = linkedSignal<ReceivedMessage[]>(() => {
    const messageCount = this.messageCount();
    return messageCount ? Array.from({ length: messageCount }) : [];
  });

  protected async loadMessages($event: TableLazyLoadEvent) {
    const first = $event.first ?? 0;
    const rows = $event.rows ?? 0;

    await this.loadRows(first, rows, this.pageId());

    //trigger change detection
    $event.forceUpdate?.();
  }

  private async loadRows(first: number, rows: number, pageId: UUID) {
    let messages = await repository.getMessages(pageId, this.messageFilter(), first, rows);


    messages = this.messageModificationEngine.applyBatchActions(messages, this.batchModificationActions() ?? []);

      //populate page of virtual cars
    this.messages.update((vm) => {
      const newMessages = [
        ...vm.slice(0, first),
        ...messages.slice(0, rows),
        ...vm.slice(first + rows, vm.length),
      ];

      return newMessages;
    });
  }

  protected selectionChanged($event: string | string[] | undefined) {
    if (!$event) {
      this.selectedMessageSequence.set(undefined);
    } else if (typeof $event === 'string') {
      this.selectedMessageSequence.set($event);
    } else {
      this.selectedMessageSequence.set($event[0]);
    }
  }
}
