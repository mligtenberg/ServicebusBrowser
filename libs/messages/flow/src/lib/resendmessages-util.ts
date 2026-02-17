import { inject, Injectable } from '@angular/core';
import {
  Action, MessageFilter,
  ServiceBusMessage,
} from '@service-bus-browser/messages-contracts';
import {
  MessagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageService } from 'primeng/api';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { BatchActionsService } from './batch-actions/batch-actions.service';
import { Store } from '@ngrx/store';
import { filter, lastValueFrom, take } from 'rxjs';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class ResendMessagesUtil {
  private messageService = inject(MessageService);
  private batchActionsService = inject(BatchActionsService);
  private store = inject(Store);

  async resendMessages(
    endpoint: SendEndpoint,
    pageId: UUID,
    messageFilter?: MessageFilter,
    selection?: string[],
    actions?: Action[],
  ) {
    try {
      let messagesToSend: ServiceBusMessage[] = [];

      const transactionId = crypto.randomUUID();
      let count = 0;
      const messageCount = await repository.countMessages(pageId, messageFilter, selection);

      await repository.walkMessagesWithCallback(
        pageId,
        async (message) => {
          if (actions) {
            message = this.batchActionsService.applyBatchActionsToMessage(
              message,
              actions,
            );
          }
          messagesToSend.push(message);
          // Send partial batches of 50 messages at a time
          if (messagesToSend.length >= 50) {
            this.store.dispatch(
              MessagesActions.sendPartialBatch({
                transactionId,
                endpoint: endpoint,
                messages: messagesToSend,
                totalAmount: messageCount,
                lastBatch: false,
                alreadySentAmount: count,
              }),
            );
            count += messagesToSend.length;
            messagesToSend = [];

            // Wait until the transaction is finished before continuing to the next batch
            await lastValueFrom(this.store.select(MessagesSelectors.selectIsTransactionRunning(transactionId)).pipe(
              filter(isRunning => !isRunning),
              take(1)
            ));
          }
        },
        messageFilter,
        undefined,
        undefined,
        true,
        selection,
      );

      this.store.dispatch(
        MessagesActions.sendPartialBatch({
          transactionId,
          endpoint: endpoint,
          messages: messagesToSend,
          totalAmount: messageCount,
          lastBatch: true,
          alreadySentAmount: count,
        }),
      );

      if (messagesToSend && messagesToSend.length > 0) {
        this.messageService.add({
          severity: 'success',
          summary: 'Messages Sent',
          detail: `${messagesToSend.length} messages have been sent`,
        });
      }
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send messages. Check the logs for details.',
      });
    }
  }
}
