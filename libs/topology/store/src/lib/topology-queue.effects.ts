import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectNamespaceById } from './topology.selectors';

@Injectable()
export class TopologyQueueEffects {
  store = inject(Store);
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);

  loadQueues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadQueues),
    mergeMap(({ namespaceId }) => from(this.serviceBusClient.listQueues(namespaceId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load queues', detail: error.toString()} }]),
      switchMap((queues) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queues })),
        take(1)
      )),
      map(({queues, namespace}) => {
        if (queues instanceof Array) {
          return internalActions.queuesLoaded({ namespace: namespace!, queues })
        }
        return internalActions.failedToLoadQueues({ namespace: namespace!, error: queues.problem})
      })
    )),
  ));

  loadQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadQueue),
    mergeMap(({ namespaceId, queueId }) => from(this.serviceBusClient.getQueue(namespaceId, queueId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({queue, namespace}) => {
        if ('problem' in queue) {
          return internalActions.failedToLoadQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueLoaded({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  addQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addQueue),
    mergeMap(({ namespaceId, queue }) => from(this.serviceBusClient.createQueue(namespaceId, queue)).pipe(
      map(() => queue),
      catchError((error) => [{ problem: { title: 'failed to add queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({ namespace, queue }) => {
        if ('problem' in queue) {
          return internalActions.failedToAddQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueAdded({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  editQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.editQueue),
    mergeMap(({ namespaceId, queue }) => from(this.serviceBusClient.editQueue(namespaceId, queue)).pipe(
      map(() => queue),
      catchError((error) => [{ problem: { title: 'failed to edit queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({ namespace, queue }) => {
        if ('problem' in queue) {
          return internalActions.failedToEditQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueEdited({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  removeQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.removeQueue),
    mergeMap(({ namespaceId, queueId }) => from(this.serviceBusClient.removeQueue(namespaceId, queueId)).pipe(
      map(() => queueId),
      catchError((error) => [{ problem: { title: 'failed to remove queue', detail: error.toString()} }]),
      switchMap((queueId) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queueId })),
        take(1)
      )),
      map(({ namespace, queueId }) => {
        if (typeof(queueId) === 'object') {
          return internalActions.failedToEditQueue({ namespace: namespace!, error: queueId.problem });
        }
        return internalActions.queueRemoved({ namespace: namespace!, queueId: queueId });
      })
    )),
  ));

  loadQueuesOnNamespaceLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    mergeMap(({ namespaces }) =>
      from(namespaces.map((ns) => actions.loadQueues({ namespaceId: ns.id })))
    )
  ));

  loadQueueOnQueueAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueAdded),
    mergeMap(({ queue, namespace }) =>
      from([actions.loadQueue({ namespaceId: namespace.id, queueId: queue.id })])
    )
  ));
}
