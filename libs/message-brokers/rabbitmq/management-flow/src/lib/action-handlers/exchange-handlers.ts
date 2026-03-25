import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { RabbitMqManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

provideActionHandler('rabbitmq:exchange:add', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-rabbitmq',
    'connections',
    action.parameters['connectionId'],
    'vhosts',
    action.parameters['vhostName'],
    'exchanges',
    'add',
  ]);
});

provideActionHandler('rabbitmq:exchange:edit', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-rabbitmq',
    'connections',
    action.parameters['connectionId'],
    'vhosts',
    action.parameters['vhostName'],
    'exchanges',
    'edit',
    action.parameters['exchangeName'],
  ]);
});

provideActionHandler('rabbitmq:exchange:delete', async (action) => {
  const confirmationService = inject(ConfirmationService);
  const managementClient = inject(RabbitMqManagementFrontendClient);
  const refreshUtil = inject(RefreshUtil);

  const connectionId = action.parameters['connectionId'];
  const vhostName = action.parameters['vhostName'];
  const exchangeName = action.parameters['exchangeName'];

  if (
    !connectionId ||
    !vhostName ||
    !exchangeName ||
    typeof connectionId !== 'string' ||
    typeof vhostName !== 'string' ||
    typeof exchangeName !== 'string'
  ) {
    throw new Error('Connection ID, vhost name, and exchange name are required parameters');
  }

  const result = await confirmationService.confirm(
    'Deleting exchange',
    `Are you sure you want to delete the exchange '${exchangeName}' in vhost '${vhostName}'?`,
    'delete',
    'cancel',
  );

  if (result) {
    await managementClient.deleteExchange(connectionId, vhostName, exchangeName);
    refreshUtil.refreshExchanges(connectionId, vhostName);
  }
});
