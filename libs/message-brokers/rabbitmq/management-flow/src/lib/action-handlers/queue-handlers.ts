import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { RabbitMqManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

provideActionHandler('rabbitmq:queue:add', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-rabbitmq',
    'connections',
    action.parameters['connectionId'],
    'vhosts',
    action.parameters['vhostName'],
    'queues',
    'add',
  ]);
});

provideActionHandler('rabbitmq:queue:edit', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-rabbitmq',
    'connections',
    action.parameters['connectionId'],
    'vhosts',
    action.parameters['vhostName'],
    'queues',
    'edit',
    action.parameters['queueName'],
  ]);
});

provideActionHandler('rabbitmq:queue:delete', async (action) => {
  const confirmationService = inject(ConfirmationService);
  const managementClient = inject(RabbitMqManagementFrontendClient);
  const refreshUtil = inject(RefreshUtil);

  const connectionId = action.parameters['connectionId'];
  const vhostName = action.parameters['vhostName'];
  const queueName = action.parameters['queueName'];

  if (
    !connectionId ||
    !vhostName ||
    !queueName ||
    typeof connectionId !== 'string' ||
    typeof vhostName !== 'string' ||
    typeof queueName !== 'string'
  ) {
    throw new Error('Connection ID, vhost name, and queue name are required parameters');
  }

  const result = await confirmationService.confirm(
    'Deleting queue',
    `Are you sure you want to delete the queue '${queueName}' in vhost '${vhostName}'?`,
    'delete',
    'cancel',
  );

  if (result) {
    await managementClient.deleteQueue(connectionId, vhostName, queueName);
    refreshUtil.refreshQueues(connectionId, vhostName);
  }
});
