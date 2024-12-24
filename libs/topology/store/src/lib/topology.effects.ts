import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { map, switchMap } from 'rxjs';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { Action } from '@ngrx/store';

@Injectable()
export class TopologyEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return actions.loadNamespaces();
  }
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);

  loadNamespaces$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadNamespaces),
    switchMap(() => this.serviceBusClient.listConnections()),
    map((namespaces) =>
      internalActions.namespacesLoaded({
        namespaces: namespaces.map<Namespace>((ns) => ({
          id: ns,
          name: ns,
        })),
      })
    )
  ));
}
