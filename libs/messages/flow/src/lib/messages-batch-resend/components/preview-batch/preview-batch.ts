import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import MessagesViewer from '../../../messages-viewer/messages-viewer';
import { UUID } from '@service-bus-browser/shared-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';

// FIRE_AND_FORGET_REPOSITORY: assigned in a microtask before NgRx effects run
let repository!: Awaited<ReturnType<typeof getMessagesRepository>>;
getMessagesRepository().then((r) => (repository = r));
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { MessageFilter } from '@service-bus-browser/filtering';
import {
  MessageModificationAction,
  MessageModificationEngine,
} from '@service-bus-browser/message-modification-engine';
import {
  ClearNonResendableProperties,
  ReceivedMessage,
} from '@service-bus-browser/api-contracts';
import { MenuItem } from 'primeng/api';


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

  propertiesContextMenu = input<MenuItem[]>([]);
  applicationPropertiesContextMenu = input<MenuItem[]>([]);
  headersContextMenu = input<MenuItem[]>([]);
  deliveryAnnotationsContextMenu = input<MenuItem[]>([]);
  messageAnnotationsContextMenu = input<MenuItem[]>([]);

  propertiesContextMenuSelection = model<{ key: string; value: unknown } | undefined>(undefined);
  applicationPropertiesContextMenuSelection = model<{ key: string; value: unknown } | undefined>(undefined);
  headersContextMenuSelection = model<{ key: string; value: unknown } | undefined>(undefined);
  deliveryAnnotationsContextMenuSelection = model<{ key: string; value: unknown } | undefined>(undefined);
  messageAnnotationsContextMenuSelection = model<{ key: string; value: unknown } | undefined>(undefined);

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

  // Raw messages as loaded from the repository, with headers/annotations cleared
  // but no modification actions applied yet.
  private rawMessages = linkedSignal<ReceivedMessage[]>(() => {
    const messageCount = this.messageCount();
    return messageCount ? Array.from({ length: messageCount }) : [];
  });

  // Apply the modification actions reactively so the viewer refreshes whenever
  // the action list changes, without re-fetching from the repository.
  messages = computed<ReceivedMessage[]>(() => {
    const actions = this.batchModificationActions() ?? [];
    return this.rawMessages().map((message) =>
      message
        ? this.messageModificationEngine.applyBatchActionsToMessage(
            message,
            actions,
          )
        : message,
    );
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

    // Mirror the resend path: outgoing messages have headers and annotations
    // cleared. Modification actions are applied reactively in the `messages`
    // computed so the preview refreshes when the action list changes.
    // key/sequence are preserved for row selection.
    messages = messages.map((message) => ClearNonResendableProperties(message));

      //populate page of virtual cars
    this.rawMessages.update((vm) => {
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
