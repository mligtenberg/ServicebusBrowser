import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import * as internalActions from './topology.internal-actions';
import { tap } from 'rxjs';

export class TopologyToastsEffects {
  actions$ = inject(Actions);
  messageService = inject(MessageService);

  showToastOnQueueAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueAdded),
    tap(({ queue, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-plus',
        summary: 'Queue Added',
        detail: `Queue ${queue.name} added to namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnQueueAddFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddQueue),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Add Queue',
        detail: `Failed to add queue: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnQueueEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueEdited),
    tap(({ queue, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-edit',
        summary: 'Queue Edited',
        detail: `Queue ${queue.name} edited in namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnQueueEditFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditQueue),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Edit Queue',
        detail: `Failed to edit queue: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnQueueRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueRemoved),
    tap(({ queueId, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-trash',
        summary: 'Queue Removed',
        detail: `Queue ${queueId} removed from namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnQueueRemoveFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveQueue),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Remove Queue',
        detail: `Failed to remove queue: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicAdded),
    tap(({ topic, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-plus',
        summary: 'Topic Added',
        detail: `Topic ${topic.name} added to namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicAddFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddTopic),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Add Topic',
        detail: `Failed to add topic: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicEdited),
    tap(({ topic, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-edit',
        summary: 'Topic Edited',
        detail: `Topic ${topic.name} edited in namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicEditFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditTopic),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Edit Topic',
        detail: `Failed to edit topic: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicRemoved),
    tap(({ topicId, namespace }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-trash',
        summary: 'Topic Removed',
        detail: `Topic ${topicId} removed from namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnTopicRemoveFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveTopic),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Remove Topic',
        detail: `Failed to remove topic: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionAdded),
    tap(({ subscription, namespace, topic }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-plus',
        summary: 'Subscription Added',
        detail: `Subscription ${subscription.name} added to topic ${topic.name} in namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionAddFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddSubscription),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Add Subscription',
        detail: `Failed to add subscription: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionEdited),
    tap(({ subscription, namespace, topic }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-edit',
        summary: 'Subscription Edited',
        detail: `Subscription ${subscription.name} edited in topic ${topic.name} in namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionEditFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditSubscription),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Edit Subscription',
        detail: `Failed to edit subscription: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRemoved),
    tap(({ subscriptionId, namespace, topic }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-trash',
        summary: 'Subscription Removed',
        detail: `Subscription ${subscriptionId} removed from topic ${topic.name} in namespace ${namespace.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRemoveFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveSubscription),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Remove Subscription',
        detail: `Failed to remove subscription: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRuleAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleAdded),
    tap(({ rule, namespace, topic, subscription }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-plus',
        summary: 'Rule Added',
        detail: `Rule ${rule.name} added to subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRuleAddFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddSubscriptionRule),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Add Rule',
        detail: `Failed to add rule: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRuleEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleEdited),
    tap(({ rule, namespace, topic, subscription }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-edit',
        summary: 'Rule Edited',
        detail: `Rule ${rule.name} edited in subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRuleEditFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditSubscriptionRule),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Edit Rule',
        detail: `Failed to edit rule: ${error.title} - ${error.detail}`,
      });
    })
  ), { dispatch: false });

  showToastOnSubscriptionRuleRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleRemoved),
    tap(({ ruleName, namespace, topic, subscription }) => {
      this.messageService.add({
        severity: 'success',
        icon: 'pi pi-trash',
        summary: 'Rule Removed',
        detail: `Rule ${ruleName} removed from subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`,
      });
    }),
  ), { dispatch: false });

  showToastOnSubscriptionRuleRemoveFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveSubscriptionRule),
    tap(({ error }) => {
      this.messageService.add({
        severity: 'error',
        icon: 'pi pi-exclamation-triangle',
        summary: 'Failed to Remove Rule',
        detail: `Failed to remove rule: ${error.title} - ${error.detail}`,
      });
    }),
  ), { dispatch: false });

}
