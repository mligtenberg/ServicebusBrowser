import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  ReceiveEndpoint,
  ReceiveOptions,
} from '@service-bus-browser/api-contracts';
import { MessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { messagePagesEffectActions } from './messages.effect-actions';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { Logger } from '@service-bus-browser/logs-services';
import { TasksSelectors } from '@service-bus-browser/tasks-store';
import { firstValueFrom } from 'rxjs';
import { UUID } from '@service-bus-browser/shared-contracts';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class LoadMessagesUtil {
  private store = inject(Store);
  private messagesClient = inject(MessagesFrontendClient);
  private logger = inject(Logger);

  async loadMessages(endpoint: ReceiveEndpoint, options: ReceiveOptions) {
    options = {
      ...options,
      maxAmountOfMessagesToReceive: options.maxAmountOfMessagesToReceive ?? 100,
    };

    const maxAmount = options.maxAmountOfMessagesToReceive;
    let loadedAmount = 0;

    const taskId = crypto.randomUUID();
    this.store.dispatch(
      TasksActions.createTask({
        id: taskId,
        description: `loading messages from ${endpoint.longDisplayName}`,
        hasProgress: true,
        initialProgress: 0,
        statusDescription: `0/${maxAmount}`,
        cancelable: true,
      }),
    );
    this.logger.info(`Loading messages from ${endpoint.longDisplayName}`);

    let continuationToken: string | undefined = undefined;
    const pageId = crypto.randomUUID();

    await repository.addPage({
      id: pageId,
      name: endpoint.longDisplayName,
      retrievedAt: new Date(),
    });

    this.store.dispatch(
      messagePagesEffectActions.pageCreated({
        pageId,
        pageName: endpoint.longDisplayName,
        disabled: true,
      }),
    );

    // Some message providers might return 0 messages if the time between the sent of messages is large
    // To avoid loading half pages, we will retry loading messages if we get 0 messages for 3 consecutive times
    let zeroMessagesLoadedCount = 0;

    do {
      const result = await this.messagesClient.retrieveMessages(
        endpoint,
        options,
        continuationToken,
      );

      continuationToken = result.continuationToken;

      if (await this.isTaskCanceled(taskId)) {
        await this.handleTaskCanceled(pageId, endpoint);
        return;
      }

      await repository.addMessages(pageId, result.messages);
      loadedAmount += result.messages.length;

      this.store.dispatch(
        TasksActions.setProgress({
          id: taskId,
          statusDescription: `${loadedAmount}/${maxAmount!}`,
          progress: (loadedAmount / maxAmount!) * 100,
        }),
      );

      if (result.messages.length === 0) {
        zeroMessagesLoadedCount++;
      }

      if (zeroMessagesLoadedCount === 3) {
        this.logger.warn(`Could not retrieve more messages for ${endpoint.displayName}.`, {
          pageId,
          endpoint,
          continuationToken,
          result,
        });
        break;
      }
    } while (continuationToken);

    this.store.dispatch(TasksActions.completeTask({ id: taskId }));
    this.store.dispatch(messagePagesEffectActions.pageLoaded({ pageId, endpoint }));
  }

  private async handleTaskCanceled(pageId: UUID, endpoint: ReceiveEndpoint) {
    this.logger.warn(`Retrieval of messages from ${endpoint.displayName} canceled.`, {
      pageId
    });
    this.store.dispatch(messagePagesEffectActions.pageLoadCancelled({ pageId, endpoint }));
  }

  private isTaskCanceled(taskId: UUID) {
    return firstValueFrom(this.store.select(TasksSelectors.selectTaskCanceled(taskId)));
  }
}
