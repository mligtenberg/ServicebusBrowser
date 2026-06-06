import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@service-bus-browser/logs-services';
import * as internalActions from './connections.internal-actions';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsLogsEffects {
  actions$ = inject(Actions);
  logger = inject(Logger);

  logConnectionAdded$ = createEffect(
    () => this.actions$.pipe(
      ofType(internalActions.connectionAdded),
      tap(({ connectionId }) => this.logger.info(`Connection with id ${connectionId} has been added`)),
    ),
    { dispatch: false },
  )

  logFailedToAddConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(internalActions.failedToAddConnection),
      tap(({ connectionId, error }) => this.logger.error(`Failed to add connection with id ${connectionId}: ${error.title}`)),
    ),
    { dispatch: false },
  )

  logConnectionCheckFailed$ = createEffect(
    () => this.actions$.pipe(
      ofType(internalActions.connectionCheckFailed),
      tap(({ connection, error }) => this.logger.error(`Connection test failed for "${connection.name}": ${error.detail}`)),
    ),
    { dispatch: false },
  )
}
