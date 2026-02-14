import { inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { catchError, EMPTY, from, map, mergeMap, switchMap } from 'rxjs';
import {
  loadPagesFromDb,
  messagesImported,
  messagesImportFailed,
  pageCreated,
  peekMessagesLoad,
  peekMessagesPartLoaded,
} from './messages.internal-actions';
import { closePage, importMessages, peekMessages } from './messages.actions';
import { importZipFile } from './import-zip-file.func';
import { FilesService } from '@service-bus-browser/services';

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
  fileService = inject(FilesService);

  loadPagesFromDb$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPagesFromDb),
      switchMap(() => from(repository.getPages())),
      mergeMap((pages) => pages.map((page) => pageCreated({
        pageId: page.id,
        pageName: page.name,
        loadedFromDb: true,
      }))),
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

  importMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(importMessages),
        mergeMap(() =>
          from(
            this.fileService.openFile(
              [{ name: 'messages export zip', extensions: ['.zip'] }],
              'binary',
            ),
          ).pipe(
            switchMap(({ fileName, contents }) => {
              return from(importZipFile(contents)).pipe(
                map((messages) => ({
                  pageName: fileName.replace(/\.zip$/, ''),
                  messages,
                })),
              );
            }),
            mergeMap(({ pageName, messages }) => {
              if (messages.length === 0) {
                return EMPTY;
              }
              const pageId = crypto.randomUUID();
              const task = repository
                .addPage({
                  id: pageId,
                  name: pageName,
                  retrievedAt: new Date(),
                })
                .then(() => repository.addMessages(pageId, messages));

              return from(task).pipe(
                map(() =>
                  messagesImported({
                    pageId,
                    pageName,
                  }),
                ),
              );
            }),
            catchError(() => [messagesImportFailed()]),
          ),
        ),
      ),
    { dispatch: true },
  );
}
