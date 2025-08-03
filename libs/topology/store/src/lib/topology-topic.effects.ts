import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectNamespaceById } from './topology.selectors';

@Injectable()
export class TopologyTopicEffects {
  store = inject(Store);
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementFrontendClient);

  loadTopics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTopics),
      mergeMap(({ namespaceId }) =>
        from(this.serviceBusClient.listTopics(namespaceId)).pipe(
          catchError((error) => [
            {
              problem: {
                title: 'failed to load topics',
                detail: error.toString(),
              },
            },
          ]),
          switchMap((topics) =>
            this.store.select(selectNamespaceById(namespaceId)).pipe(
              map((namespace) => ({ namespace, topics })),
              take(1)
            )
          ),
          map(({ topics, namespace }) => {
            if (topics instanceof Array) {
              return internalActions.topicsLoaded({
                namespace: namespace!,
                topics,
              });
            }

            return internalActions.failedToLoadTopics({
              namespace: namespace!,
              error: topics.problem,
            });
          })
        )
      )
    )
  );

  loadTopic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTopic),
      mergeMap(({ namespaceId, topicId }) =>
        from(this.serviceBusClient.getTopic(namespaceId, topicId)).pipe(
          catchError((error) => [
            {
              problem: {
                title: 'failed to load topic',
                detail: error.toString(),
              },
            },
          ]),
          switchMap((topic) =>
            this.store.select(selectNamespaceById(namespaceId)).pipe(
              map((namespace) => ({ namespace, topic })),
              take(1)
            )
          ),
          map(({ topic, namespace }) => {
            if ('problem' in topic) {
              return internalActions.failedToLoadTopic({
                namespace: namespace!,
                error: topic.problem,
              });
            }
            return internalActions.topicLoaded({
              namespace: namespace!,
              topic: topic,
            });
          })
        )
      )
    )
  );

  addTopic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addTopic),
      mergeMap(({ namespaceId, topic }) =>
        from(this.serviceBusClient.createTopic(namespaceId, topic)).pipe(
          map(() => topic),
          catchError((error) => [
            {
              problem: {
                title: 'failed to add topic',
                detail: error.toString(),
              },
            },
          ]),
          switchMap((topic) =>
            this.store.select(selectNamespaceById(namespaceId)).pipe(
              map((namespace) => ({ namespace, topic })),
              take(1)
            )
          ),
          map(({ namespace, topic }) => {
            if ('problem' in topic) {
              return internalActions.failedToAddTopic({
                namespace: namespace!,
                error: topic.problem,
              });
            }
            return internalActions.topicAdded({
              namespace: namespace!,
              topic: topic,
            });
          })
        )
      )
    )
  );

  editTopic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.editTopic),
      mergeMap(({ namespaceId, topic }) =>
        from(this.serviceBusClient.editTopic(namespaceId, topic)).pipe(
          map(() => topic),
          catchError((error) => [
            {
              problem: {
                title: 'failed to edit topic',
                detail: error.toString(),
              },
            },
          ]),
          switchMap((topic) =>
            this.store.select(selectNamespaceById(namespaceId)).pipe(
              map((namespace) => ({ namespace, topic })),
              take(1)
            )
          ),
          map(({ namespace, topic }) => {
            if ('problem' in topic) {
              return internalActions.failedToEditTopic({
                namespace: namespace!,
                error: topic.problem,
              });
            }
            return internalActions.topicEdited({
              namespace: namespace!,
              topic: topic,
            });
          })
        )
      )
    )
  );

  deleteTopic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.removeTopic),
      mergeMap(({ namespaceId, topicId }) =>
        from(this.serviceBusClient.removeTopic(namespaceId, topicId)).pipe(
          map(() => topicId),
          catchError((error) => [
            {
              problem: {
                title: 'failed to delete topic',
                detail: error.toString(),
              },
            },
          ]),
          switchMap((topicId) =>
            this.store.select(selectNamespaceById(namespaceId)).pipe(
              map((namespace) => ({ namespace, topicId })),
              take(1)
            )
          ),
          map(({ namespace, topicId }) => {
            if (typeof topicId === 'object') {
              return internalActions.failedToEditTopic({
                namespace: namespace!,
                error: topicId.problem,
              });
            }
            return internalActions.topicRemoved({
              namespace: namespace!,
              topicId: topicId,
            });
          })
        )
      )
    )
  );

  loadTopicOnTopicAdded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.topicAdded),
      mergeMap(({ topic, namespace }) =>
        from([
          actions.loadTopic({ namespaceId: namespace.id, topicId: topic.id }),
        ])
      )
    )
  );

  loadTopicsOnNamespaceLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.namespacesLoaded),
      mergeMap(({ namespaces }) =>
        from(namespaces.map((ns) => actions.loadTopics({ namespaceId: ns.id })))
      )
    )
  );
}
