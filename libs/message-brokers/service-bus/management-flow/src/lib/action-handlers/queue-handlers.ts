import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

provideActionHandler('service-bus:queue:add', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'queues',
    'add',
  ]);
});
provideActionHandler('service-bus:queue:edit', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'queues',
    'edit',
    action.parameters['queueName'],
  ]);
});

provideActionHandler('service-bus:queue:delete', async (action) => {
  const confirmationService = inject(ConfirmationService);
  const managementClient = inject(ServiceBusManagementFrontendClient);
  const refreshUtil = inject(RefreshUtil);

  const connectionId = action.parameters['connectionId'];
  const queueName = action.parameters['queueName'];

  if (!connectionId || !queueName || typeof connectionId !== 'string' || typeof queueName !== 'string') {
    throw new Error('Connection ID and queue name are required parameters');
  }

  const result = await confirmationService.confirm(
    'Deleting queue',
    `Are you sure you want to delete the queue '${queueName}'?`,
    'delete',
    'cancel'
  );

  if (result) {
    await managementClient.removeQueue(
      connectionId,
      queueName
    );
  }

  refreshUtil.refreshQueues(connectionId);
})

