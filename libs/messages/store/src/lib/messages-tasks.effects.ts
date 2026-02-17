import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { map } from 'rxjs';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';

@Injectable({
  providedIn: 'root',
})
export class MessagesTasksEffects {
  actions = inject(Actions);

  createTask$ = createEffect(() =>
    this.actions.pipe(
      ofType(internalActions.peekMessagesLoad),
      map(({ pageId, maxAmount, endpoint }) => {
        const endpointName =
          'queueName' in endpoint
            ? endpoint.queueName
            : `${endpoint.topicName}/${endpoint.subscriptionName}`;

        return TasksActions.createTask({
          id: pageId,
          statusDescription: `0/${maxAmount}`,
          description: `loading messages from ${endpointName}`,
          hasProgress: true,
          initialProgress: 0,
        });
      }),
    ),
  );

  taskForBatch$ = createEffect(() =>
    this.actions.pipe(
      ofType(actions.sendPartialBatch),
      map(({transactionId, endpoint, messages, lastBatch, totalAmount, alreadySentAmount }) => {
        const totalMessages = messages.length + alreadySentAmount;

        if (lastBatch) {
          return TasksActions.completeTask({
            id: transactionId,
            statusDescription: `${totalMessages}/${totalAmount}`,
          });
        }
        if (alreadySentAmount === 0) {
          return TasksActions.createTask({
            id: transactionId,
            statusDescription: `${totalMessages}/${totalAmount}`,
            description: `sending messages to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`,
            hasProgress: true,
            initialProgress: 0,
          });
        }

        return TasksActions.setProgress({
          id: transactionId,
          statusDescription: `${totalMessages}/${totalAmount}`,
          progress: ((alreadySentAmount + messages.length) / totalAmount) * 100,
        });
      }),
    ),
  );

  updateTaskProgress$ = createEffect(() =>
    this.actions.pipe(
      ofType(internalActions.peekMessagesPartLoaded),
      map(({ pageId, maxAmount, amountLoaded }) =>
        TasksActions.setProgress({
          id: pageId,
          statusDescription: `${amountLoaded}/${maxAmount + amountLoaded}`,
          progress: (amountLoaded / (maxAmount + amountLoaded)) * 100,
        }),
      ),
    ),
  );

  completeTask$ = createEffect(() =>
    this.actions.pipe(
      ofType(actions.peekMessagesLoadingDone),
      map(({ pageId }) => TasksActions.completeTask({ id: pageId })),
    ),
  );

  clearTask$ = createEffect(() =>
    this.actions.pipe(
      ofType(actions.clearEndpoint),
      map(({ endpoint }) => {
        const endpointName =
          'queueName' in endpoint
            ? endpoint.queueName
            : `${endpoint.topicName}/${endpoint.subscriptionName}`;

        return TasksActions.createTask({
          id: `${endpoint.connectionId}/${endpointName}/${endpoint.channel}`,
          statusDescription: '0',
          description: `clearing messages from ${endpointName}`,
          hasProgress: false,
        });
      }),
    ),
  );

  doneClearingTask$ = createEffect(() =>
    this.actions.pipe(
      ofType(actions.clearedEndpoint),
      map(({ endpoint }) => {
        const endpointName =
          'queueName' in endpoint
            ? endpoint.queueName
            : `${endpoint.topicName}/${endpoint.subscriptionName}`;

        return TasksActions.completeTask({
          id: `${endpoint.connectionId}/${endpointName}/${endpoint.channel}`,
        });
      }),
    ),
  );

  messagesSending$ = createEffect(() =>
    this.actions.pipe(
      ofType(internalActions.messagesSending),
      map(({ endpoint, messagesToSend, sendAmount, taskId }) => {
        if (sendAmount > 0) {
          const totalMessages = messagesToSend.length + sendAmount;
          return TasksActions.setProgress({
            id: taskId,
            statusDescription: `${sendAmount}/${totalMessages}`,
            progress: (sendAmount / totalMessages) * 100,
          });
        }

        return TasksActions.createTask({
          id: taskId,
          statusDescription: `0/${messagesToSend.length}`,
          description: `sending messages to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`,
          hasProgress: true,
          initialProgress: 0,
        });
      }),
    ),
  );

  messagesSendSucceeded$ = createEffect(() =>
    this.actions.pipe(
      ofType(internalActions.messagesSendSucceeded),
      map(({ taskId }) => TasksActions.completeTask({ id: taskId })),
    ),
  );
}
