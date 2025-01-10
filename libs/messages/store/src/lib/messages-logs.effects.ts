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
    ofType(internalActions.peakMessagesPartLoaded),
    tap(({ connectionId, endpoint, maxAmount, amountLoaded }) => {
      this.logger.info(`Loaded ${amountLoaded} of ${maxAmount + amountLoaded} messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName} in ${connectionId}`);
    })
  ), { dispatch: false });

  logLoadingDone$ = createEffect(() => this.actions.pipe(
    ofType(actions.peakMessagesLoadingDone),
    tap(({ connectionId, endpoint }) => {
      this.logger.info(`Finished loading messages from ${'queueName' in endpoint ? endpoint.queueName : endpoint.subscriptionName} in ${connectionId}`);
    })
  ), { dispatch: false });
}
