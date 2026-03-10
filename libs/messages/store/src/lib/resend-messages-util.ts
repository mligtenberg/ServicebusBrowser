import { inject, Injectable } from '@angular/core';
import { Message, SendEndpoint, ToMessageToSend } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { Store } from '@ngrx/store';
import { MessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { MessageModificationAction, MessageModificationEngine } from '@service-bus-browser/message-modification-engine';
import { MessageFilter } from '@service-bus-browser/filtering';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { messagePagesEffectActions } from './messages.effect-actions';
import { Logger } from '@service-bus-browser/logs-services';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class ResendMessagesUtil {
  private messageClient = inject(MessagesFrontendClient);
  private messageModificationEngine = inject(MessageModificationEngine);
  private store = inject(Store);
  private logger = inject(Logger);

  async resendMessages(
    endpoint: SendEndpoint,
    pageId: UUID,
    messageFilter?: MessageFilter,
    selection?: string[],
    modificationActions?: MessageModificationAction[],
  ) {
    try {
      let messagesToSend: Message[] = [];

      const taskId = crypto.randomUUID();
      const messageCount = await repository.countMessages(
        pageId,
        messageFilter,
        selection,
      );

      this.store.dispatch(
        TasksActions.createTask({
          id: taskId,
          description: `resending messages from ${endpoint.displayName}`,
          hasProgress: true,
          initialProgress: 0,
          statusDescription: `0/${messageCount}`,
          cancelable: false,
        }),
      );

      await repository.walkMessagesWithCallback(
        pageId,
        async (message, index) => {
          let messageToSend = ToMessageToSend(message);

          if (modificationActions?.length) {
            messageToSend =
              this.messageModificationEngine.applyBatchActionsToMessage(
                message,
                modificationActions,
              );
          }
          messagesToSend.push(messageToSend);

          if (messagesToSend.length >= 250) {
            await this.messageClient.sendMessages(endpoint, messagesToSend);
            messagesToSend = [];
            this.store.dispatch(
              TasksActions.setProgress({
                id: taskId,
                statusDescription: `${index + 1}/${messageCount}`,
                progress: (index + 1 / messageCount) * 100,
              }),
            );
          }
        },
        messageFilter,
        undefined,
        undefined,
        true,
        selection,
      );

      if (messagesToSend && messagesToSend.length > 0) {
        await this.messageClient.sendMessages(endpoint, messagesToSend);
      }

      this.logger.info(`Resent ${messagesToSend.length} messages to ${endpoint.displayName}`);
      this.store.dispatch(TasksActions.completeTask({ id: taskId }));
    } catch (error) {
      const errorMessages =
        error instanceof Error ? error.message : error?.toString();

      this.logger.error(`Failed to resend messages: ${errorMessages}`);
    }

    this.store.dispatch(
      messagePagesEffectActions.messagesResent({
        endpoint: endpoint,
      }),
    );
  }
}
