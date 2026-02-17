import { inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { forkJoin, from, map, mergeMap, switchMap } from 'rxjs';
import {
  loadPagesFromDb,
  pageCreated,
  peekMessagesLoad,
  peekMessagesPartLoaded,
  updatePageName,
} from './messages.internal-actions';
import {
  closePage,
  peekMessages,
  peekMessagesLoadingDone,
} from './messages.actions';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class MessagesDbEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return loadPagesFromDb();
  }

  store = inject(Store);
  actions$ = inject(Actions);

  loadPagesFromDb$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPagesFromDb),
      switchMap(() => from(repository.getPages())),
      mergeMap((pages) =>
        pages
          .sort((a, b) => a.retrievedAt > b.retrievedAt ? 1 : -1)
          .map((page) =>
            pageCreated({
              pageId: page.id,
              pageName: page.name,
              loadedFromDb: true,
            }),
          ),
      ),
    ),
  );

  addPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(peekMessages),
      mergeMap(({ endpoint, maxAmount, fromSequenceNumber }) => {
        const pageId = crypto.randomUUID();
        let name =
          'queueName' in endpoint
            ? endpoint.queueName
            : `${endpoint.topicName}/${endpoint.subscriptionName}`;
        if (endpoint.channel) {
          name += ` (${endpoint.channel})`;
        }

        return from(
          repository.addPage({
            id: pageId,
            name: name,
            retrievedAt: new Date(),
          }),
        ).pipe(
          mergeMap(() => [
            pageCreated({
              pageId: pageId,
              pageName: name,
              loadedFromDb: false,
            }),
            peekMessagesLoad({
              pageId: pageId,
              endpoint,
              maxAmount,
              alreadyLoadedAmount: 0,
              fromSequenceNumber: fromSequenceNumber ?? '0',
            }),
          ]),
        );
      }),
    ),
  );

  addMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(peekMessagesPartLoaded),
        switchMap(({ pageId, messages }) => {
          return from(repository.addMessages(pageId, messages));
        }),
      ),
    {
      dispatch: false,
    },
  );

  closePage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(closePage),
        switchMap(({ pageId }) => {
          return from(repository.closePage(pageId));
        }),
      ),
    {
      dispatch: false,
    },
  );

  peekMessagesLoadingDone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(peekMessagesLoadingDone),
      switchMap(({ pageId }) => {
        return forkJoin([
          from(repository.getPage(pageId)),
          from(repository.getMessages(pageId, undefined, 0, 1, true)),
          from(repository.getMessages(pageId, undefined, 0, 1, false)),
        ]);
      }),
      map(([page, firstPage, secondPage]) =>
        updatePageName({
          pageId: page.id,
          pageName: !firstPage.length
            ? `${page.name} (empty)`
            : `${page.name} (${firstPage[0].sequenceNumber} - ${secondPage[0].sequenceNumber})`,
        }),
      ),
    ),
  );

  updatePageName$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updatePageName),
        switchMap(({ pageId, pageName }) =>
          from(repository.updatePageName(pageId, pageName)),
        ),
      ),
    { dispatch: false },
  );
}
