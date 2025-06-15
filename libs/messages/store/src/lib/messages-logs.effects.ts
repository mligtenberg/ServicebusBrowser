import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@service-bus-browser/logs-services';
import { tap } from 'rxjs';
import { Store } from '@ngrx/store';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';

@Injectable({
  providedIn: 'root'
})
export class MessagesLogsEffects {
  actions = inject(Actions);
  logger = inject(Logger);
  store = inject(Store);

  logLoadingProgress$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peekMessagesPartLoaded),
    tap(({ endpoint, maxAmount, amountLoaded }) => {
      this.logger.info(`Loaded ${amountLoaded} of ${maxAmount + amountLoaded} messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName}`);
    })
  ), { dispatch: false });

  logLoadingDone$ = createEffect(() => this.actions.pipe(
    ofType(actions.peekMessagesLoadingDone),
    tap(({ endpoint }) => {
      this.logger.info(`Finished loading messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName}`);
    })
  ), { dispatch: false });

  logClearingEndpoint$ = createEffect(() => this.actions.pipe(
    ofType(actions.clearEndpoint),
    tap(({ endpoint }) => {
      this.logger.info(`Clearing messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName}`);
    })
  ), { dispatch: false });

  logClearedEndpoint$ = createEffect(() => this.actions.pipe(
    ofType(actions.clearedEndpoint),
    tap(({ endpoint }) => {
      this.logger.info(`Cleared messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName}`);
    })
  ), { dispatch: false });

  logMessageSend$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.sendedMessage),
    tap(({ endpoint, message }) => {
      this.logger.info(`Sended message to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`);
    })
  ), { dispatch: false });

  logMessageSendFailed$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.messageSendFailed),
    tap(({ endpoint, message }) => {
      this.logger.error(`Failed to send message to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`);
    })
  ), { dispatch: false });
}
