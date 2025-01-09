import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { map } from 'rxjs';

import * as internalActions from './messages.internal-actions';

@Injectable({
  providedIn: 'root'
})
export class MessagesTasksEffects {
  actions = inject(Actions);

  createTask$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesLoad),
    map(({ pageId, maxAmount, endpoint }) => {
      const endpointName = 'queueName' in endpoint
        ? endpoint.queueName
        : `${endpoint.topicName}/${endpoint.subscriptionName}`;

      return TasksActions.createTask({
        id: pageId,
        statusDescription: `0/${maxAmount}`,
        description: `loading messages from ${endpointName}`,
        hasProgress: true,
        initialProgress: 0
      })
    }),
  ));

  updateTaskProgress$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesPartLoaded),
    map(({ pageId, maxAmount, amountLoaded }) => TasksActions.setProgress({
      id: pageId,
      statusDescription: `${amountLoaded}/${maxAmount + amountLoaded}`,
      progress: amountLoaded / (maxAmount + amountLoaded) * 100
    })),
  ));

  completeTask$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesLoadingDone),
    map(({ pageId }) => TasksActions.completeTask({ id: pageId })),
  ));
}
