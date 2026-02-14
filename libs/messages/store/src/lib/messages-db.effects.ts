import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { getPagesDb, MessagesRepository, } from '@service-bus-browser/messages-db';
import { from, switchMap } from 'rxjs';
import {
  peekMessagesLoad,
  peekMessagesPartLoaded,
} from './messages.internal-actions';
import { closePage } from './messages.actions';

const database = await getPagesDb();
const repository = new MessagesRepository(database);

@Injectable({
  providedIn: 'root',
})
export class MessagesDbEffects {
  store = inject(Store);
  actions$ = inject(Actions);

  addPage$ = createEffect(() => this.actions$.pipe(
    ofType(peekMessagesLoad),
    switchMap(({ pageId, endpoint }) => {
      let name =
        'queueName' in endpoint
          ? endpoint.queueName
          : `${endpoint.topicName}/${endpoint.subscriptionName}`;
      if (endpoint.channel) {
        name += ` (${endpoint.channel})`;
      }

      return from(repository.addPage({
        id: pageId,
        name: name,
        retrievedAt: new Date(),
      }))
    })), {
    dispatch: false
  });

  addMessages$ = createEffect(() => this.actions$.pipe(
    ofType(peekMessagesPartLoaded),
    switchMap(({ pageId, messages }) => {
      return from(repository.addMessages(pageId, messages));
    })), {
    dispatch: false
  });

  closePage$ = createEffect(() => this.actions$.pipe(
    ofType(closePage),
    switchMap(({ pageId }) => {
      return from(repository.closePage(pageId));
    })), {
      dispatch: false
    }
  )
}
