import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadQueue,
  loadSubscription,
  loadTopic,
  reloadReceiveEndpoint,
  reloadSendEndpoint,
} from './topology.actions';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TopologyEffects {
  actions$ = inject(Actions);

  reloadReceiveEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadReceiveEndpoint),
      map(({ endpoint }) => {
        if ('queueName' in endpoint) {
          return loadQueue({
            namespaceId: endpoint.connectionId,
            queueId: endpoint.queueName,
          });
        }

        return loadSubscription({
          namespaceId: endpoint.connectionId,
          topicId: endpoint.topicName,
          subscriptionId: endpoint.subscriptionName,
        });
      }),
    ),
  );

  reloadSendEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadSendEndpoint),
      map(({ endpoint }) => {
        if ('queueName' in endpoint) {
          return loadQueue({
            namespaceId: endpoint.connectionId,
            queueId: endpoint.queueName,
          })
        }

        return loadTopic({
          namespaceId: endpoint.connectionId,
          topicId: endpoint.topicName,
        })
      })
    )
  )
}
