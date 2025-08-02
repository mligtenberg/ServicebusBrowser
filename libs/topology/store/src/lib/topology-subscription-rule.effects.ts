import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-electron-client';
import { Store } from '@ngrx/store';

import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap, switchMap, take } from 'rxjs';
import { selectNamespaceById } from './topology.selectors';

@Injectable()
export class TopologySubscriptionRuleEffects {
  store = inject(Store);
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementFrontendClient);

  addSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addSubscriptionRule),
    mergeMap(({ namespaceId, topicId, subscriptionId, rule }) => from(this.serviceBusClient.createSubscriptionRule(namespaceId, topicId, subscriptionId, rule)).pipe(
      map(() => rule),
      catchError((error) => [{ problem: { title: 'failed to add subscription rule', detail: error.toString()} }]),
      switchMap((rule) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({
          namespace,
          topic: namespace?.topics.find(s => s.id === topicId),
          subscription: namespace?.topics.find(s => s.id === topicId)?.subscriptions.find(s => s.id === subscriptionId),
          rule
        })),
        take(1)
      )),
      map(({ namespace, topic, subscription, rule: updatedRule }) => {
        if ('problem' in updatedRule) {
          return internalActions.failedToAddSubscriptionRule({ namespace, topic, subscription, ruleName: rule.name, error: updatedRule.problem });
        }

        return internalActions.subscriptionRuleAdded({ namespace, topic, subscription, rule: updatedRule });
      })
    )),
  ));

  editSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.editSubscriptionRule),
    mergeMap(({ namespaceId, topicId, subscriptionId, rule }) => from(this.serviceBusClient.editSubscriptionRule(namespaceId, topicId, subscriptionId, rule)).pipe(
      map(() => rule),
      catchError((error) => [{ problem: { title: 'failed to edit subscription rule', detail: error.toString()} }]),
      switchMap((rule) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({
          namespace,
          topic: namespace?.topics.find(s => s.id === topicId),
          subscription: namespace?.topics.find(s => s.id === topicId)?.subscriptions.find(s => s.id === subscriptionId),
          rule
        })),
        take(1)
      )),
      map(({ namespace, topic, subscription, rule: updatedRule }) => {
        if ('problem' in updatedRule) {
          return internalActions.failedToEditSubscriptionRule({ namespace, topic, subscription, ruleName: rule.name, error: updatedRule.problem });
        }

        return internalActions.subscriptionRuleEdited({ namespace, topic, subscription, rule: updatedRule });
      })
    )),
  ));

  deleteSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.removeSubscriptionRule),
    mergeMap(({ namespaceId, topicId, subscriptionId, ruleName }) => from(this.serviceBusClient.removeSubscriptionRule(namespaceId, topicId, subscriptionId, ruleName)).pipe(
      map(() => ruleName),
      catchError((error) => [{ problem: { title: 'failed to delete subscription rule', detail: error.toString()} }]),
      switchMap((ruleName) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({
          namespace,
          topic: namespace?.topics.find(s => s.id === topicId),
          subscription: namespace?.topics.find(s => s.id === topicId)?.subscriptions.find(s => s.id === subscriptionId),
          ruleName
        })),
        take(1)
      )),
      map(({ namespace, topic, subscription, ruleName: originalRuleName }) => {
        if (originalRuleName instanceof Object) {
          return internalActions.failedToRemoveSubscriptionRule({ namespace, topic, subscription, ruleName: ruleName, error: originalRuleName.problem});
        }

        return internalActions.subscriptionRuleRemoved({ namespace, topic, subscription, ruleName });
      })
    )),
  ));
}
