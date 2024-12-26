import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@service-bus-browser/logs-services';
import { tap } from 'rxjs';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';

@Injectable({
  providedIn: 'root'
})
export class TopologyLoggingEffects {
  actions$ = inject(Actions);
  logger = inject(Logger);

  logNamespacesLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    tap(({ namespaces }) => this.logger.info(`${namespaces.length} Namespaces loaded`))
  ), { dispatch: false });

  logQueuesLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queuesLoaded),
    tap(({ queues, namespace }) => this.logger.info(`${queues.length} Queues loaded for namespace ${namespace.name}`))
  ), { dispatch: false });

  logTopicsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicsLoaded),
    tap(({ topics, namespace }) => this.logger.info(`${topics.length} Topics loaded for namespace ${namespace.name}`))
  ), { dispatch: false });

  logSubscriptionsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionsLoaded),
    tap(({ subscriptions, topic, namespace }) => this.logger.info(`${subscriptions.length} Subscriptions loaded for topic ${topic.name} in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToLoadNamespaces$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadNamespaces),
    tap(({ error }) => this.logger.error(`Failed to load namespaces: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadQueues$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadQueues),
    tap(({ error, namespace }) => this.logger.error(`Failed to load queues for namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadTopics$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadTopics),
    tap(({ error, namespace }) => this.logger.error(`Failed to load topics for namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadSubscriptions),
    tap(({ error, namespace, topic }) => this.logger.error(`Failed to load subscriptions for topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });
}
