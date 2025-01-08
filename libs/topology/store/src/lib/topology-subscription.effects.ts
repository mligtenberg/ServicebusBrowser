import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusManagementElectronClient } from '@service-bus-browser/service-bus-electron-client';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectNamespaceById, selectTopicById } from './topology.selectors';

@Injectable()
export class TopologySubscriptionEffects {
  store = inject(Store);
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementElectronClient);

  loadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadSubscriptions),
    mergeMap(({ namespaceId, topicId }) => from(this.serviceBusClient.listSubscriptions(namespaceId, topicId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load subscriptions', detail: error.toString()} }]),
      switchMap((subscriptions) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscriptions })),
        take(1)
      )),
      switchMap(({subscriptions, namespace}) => this.store.select(selectTopicById(namespaceId, topicId)).pipe(
        map((topic) => ({ namespace, subscriptions, topic })),
        take(1)
      )),
      map(({subscriptions, namespace, topic}) => {
        if (subscriptions instanceof Array) {
          return internalActions.subscriptionsLoaded({ namespace: namespace!, topic: topic!, subscriptions })
        }
        return internalActions.failedToLoadSubscriptions({ namespace: namespace!, topic: topic!, error: subscriptions.problem });
      })
    )),
  ));

  loadSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadSubscription),
    mergeMap(({ namespaceId, topicId, subscriptionId }) => from(this.serviceBusClient.getSubscription(namespaceId, topicId, subscriptionId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load subscription', detail: error.toString()} }]),
      switchMap((subscription) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscription })),
        take(1)
      )),
      switchMap(({subscription, namespace}) => this.store.select(selectTopicById(namespaceId
        , topicId)).pipe(
        map((topic) => ({ namespace, subscription, topic })),
        take(1)
      )),
      map(({subscription, namespace, topic}) => {
        if ('problem' in subscription) {
          return internalActions.failedToLoadSubscription({ namespace: namespace!, topic: topic!, error: subscription.problem });
        }
        return internalActions.subscriptionLoaded({ namespace: namespace!, topic: topic!, subscription: subscription });
      })
    )),
  ));

  addSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addSubscription),
    mergeMap(({ namespaceId, topicId, subscription }) => from(this.serviceBusClient.createSubscription(namespaceId, topicId, subscription)).pipe(
      map(() => subscription),
      catchError((error) => [{ problem: { title: 'failed to add subscription', detail: error.toString()} }]),
      switchMap((subscription) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscription })),
        take(1)
      )),
      switchMap(({namespace, subscription}) => this.store.select(selectTopicById(namespaceId, topicId)).pipe(
        map((topic) => ({ namespace, subscription, topic })),
        take(1)
      )),
      map(({namespace, subscription, topic}) => {
        if ('problem' in subscription) {
          return internalActions.failedToAddSubscription({ namespace: namespace!, topic: topic!, error: subscription.problem });
        }
        return internalActions.subscriptionAdded({ namespace: namespace!, topic: topic!, subscription: subscription });
      })
    ))));

  editSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(actions.editSubscription),
    mergeMap(({ namespaceId, topicId, subscription }) => from(this.serviceBusClient.editSubscription(namespaceId, topicId, subscription)).pipe(
      map(() => subscription),
      catchError((error) => [{ problem: { title: 'failed to edit subscription', detail: error.toString()} }]),
      switchMap((subscription) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscription })),
        take(1)
      )),
      switchMap(({namespace, subscription}) => this.store.select(selectTopicById(namespaceId
        , topicId)).pipe(
        map((topic) => ({ namespace, subscription, topic })),
        take(1)
      )),
      map(({namespace, subscription, topic}) => {
        if ('problem' in subscription) {
          return internalActions.failedToEditSubscription({ namespace: namespace!, topic: topic!, error: subscription.problem });
        }
        return internalActions.subscriptionEdited({ namespace: namespace!, topic: topic!, subscription: subscription });
      })
    ))));

  removeSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(actions.removeSubscription),
    mergeMap(({ namespaceId, topicId, subscriptionId }) => from(this.serviceBusClient.removeSubscription(namespaceId, topicId, subscriptionId)).pipe(
      map(() => subscriptionId),
      catchError((error) => [{ problem: { title: 'failed to remove subscription', detail: error.toString()} }]),
      switchMap((subscriptionId) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscriptionId })),
        take(1)
      )),
      switchMap(({namespace, subscriptionId}) => this.store.select(selectTopicById(namespaceId, topicId)).pipe(
        map((topic) => ({ namespace, subscriptionId, topic })),
        take(1)
      )),
      map(({namespace, subscriptionId, topic}) => {
        if (typeof(subscriptionId) === 'object') {
          return internalActions.failedToRemoveSubscription({ namespace: namespace!, topic: topic!, error: subscriptionId.problem });
        }
        return internalActions.subscriptionRemoved({ namespace: namespace!, topic: topic!, subscriptionId: subscriptionId });
      })
    ))));

  loadSubscriptionsOnTopicsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicsLoaded),
    mergeMap(({ topics, namespace }) =>
      from(topics.map((topic) => actions.loadSubscriptions({ namespaceId: namespace.id, topicId: topic.id })))
    )
  ));

  loadSubscriptionsOnTopicLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicLoaded),
    mergeMap(({ topic, namespace }) =>
      from([actions.loadSubscriptions({ namespaceId: namespace.id, topicId: topic.id })])
    )
  ));

  loadSubscriptionOnSubscriptionAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionAdded),
    mergeMap(({ subscription, namespace, topic }) =>
      from([actions.loadSubscription({ namespaceId: namespace.id, topicId: topic.id, subscriptionId: subscription.id })])
    )
  ));

  loadSubscriptionOnRuleAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleAdded),
    mergeMap(({ namespace, topic, subscription }) =>
      from([actions.loadSubscription({ namespaceId: namespace!.id, topicId: topic!.id, subscriptionId: subscription!.id })])
    )
  ));

  loadSubscriptionOnRuleRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleRemoved),
    mergeMap(({ namespace, topic, subscription }) =>
      from([actions.loadSubscription({ namespaceId: namespace!.id, topicId: topic!.id, subscriptionId: subscription!.id })])
    )
  ));
}
