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
    ofType(internalActions.peakQueueMessagesLoad),
    map(({ pageId, maxAmount, queueName }) => TasksActions.createTask({
      id: pageId,
      statusDescription: `0/${maxAmount}`,
      description: `loading messages from ${queueName}`,
      hasProgress: true,
      initialProgress: 0
    })),
  ));

  updateTaskProgress$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakQueueMessagesPartLoaded),
    map(({ pageId, maxAmount, amountLoaded }) => TasksActions.setProgress({
      id: pageId,
      statusDescription: `${amountLoaded}/${maxAmount + amountLoaded}`,
      progress: amountLoaded / (maxAmount + amountLoaded) * 100
    })),
  ));

  completeTask$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakQueueMessagesLoadingDone),
    map(({ pageId }) => TasksActions.completeTask({ id: pageId })),
  ));
}
