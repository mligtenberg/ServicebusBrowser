import { EnvironmentProviders, inject, Provider } from '@angular/core';
import { provideState, Store } from '@ngrx/store';
import { connectionsFeature } from './lib/connections.store';
import { provideEffects } from '@ngrx/effects';
import { ConnectionsEffects } from './lib/connections.effects';
import { ConnectionsLogsEffects } from './lib/connections-logs.effects';
import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { ManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { Logger } from '@service-bus-browser/logs-services';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologyActions } from '@service-bus-browser/topology-store';

export * as ConnectionsActions from './lib/connections.actions';
export * as ConnectionsSelectors from './lib/connections.selectors';
export * as ConnectionsEffectActions from './lib/connections.internal-actions';

export function provideConnectionsState(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    provideState(connectionsFeature),
    provideEffects([ConnectionsEffects, ConnectionsLogsEffects]),
  ];
}

provideActionHandler('connection:delete', async (action) => {
  const confirmService = inject(ConfirmationService);
  const managementService = inject(ManagementFrontendClient);
  const logger = inject(Logger);
  const store = inject(Store);

  const connectionId = action.parameters['connectionId'];
  const connectionName = action.parameters['connectionName'];
  if (!connectionId || typeof connectionId !== 'string') {
    return;
  }

  const confirmed = await confirmService.confirm(
    `Removing "${connectionName}"`,
    `Are you sure you want to remove the connection "${connectionName}"?`,
    `Remove connection`,
    'Cancel',
  );
  if (!confirmed) {
    return;
  }

  await managementService.removeConnection(connectionId as UUID);
  logger.info(`Connection ${connectionName} has been removed`);

  store.dispatch(TopologyActions.loadTopologyRootNodes());
});
