import { inject, Injectable } from '@angular/core';
import { Logger } from '@service-bus-browser/logs-services';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  topologyRefreshed,
  topologyRootNodesLoaded,
} from './topology.internal-actions';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TopologyLoggingEffects {
  logger = inject(Logger);
  actions$ = inject(Actions);

  logTopologyRoot$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(topologyRootNodesLoaded),
      tap(({ nodes }) => {
        if (nodes.length === 0) {
          this.logger.info('No connections found');
        }
        if (nodes.length === 1) {
          this.logger.info('Loaded 1 connection');
        }
        if (nodes.length > 1) {
          this.logger.info(`Loaded ${nodes.length} connections`);
        }
      }),
    );
  }, { dispatch: false });

  logTopologyRefresh$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(topologyRefreshed),
      tap(({ node }) => this.logger.info(`Refreshed ${node.name}`)),
    );
  }, { dispatch: false });
}
