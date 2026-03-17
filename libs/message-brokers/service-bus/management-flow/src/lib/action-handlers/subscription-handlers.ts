import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

provideActionHandler('service-bus:subscription:add', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    'add',
  ]);
});

provideActionHandler('service-bus:subscription:edit', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    'edit',
    action.parameters['subscriptionName'],
  ]);
});

provideActionHandler('service-bus:subscription:delete', async (action) => {
  const confirmationService = inject(ConfirmationService);
  const managementClient = inject(ServiceBusManagementFrontendClient);
  const refreshUtil = inject(RefreshUtil);

  const connectionId = action.parameters['connectionId'];
  const topicName = action.parameters['topicName'];
  const subscriptionName = action.parameters['subscriptionName'];

  if (
    !connectionId ||
    !topicName ||
    !subscriptionName ||
    typeof connectionId !== 'string' ||
    typeof topicName !== 'string' ||
    typeof subscriptionName !== 'string'
  ) {
    throw new Error('Connection ID, topic name, and subscription name are required parameters');
  }

  const result = await confirmationService.confirm(
    'Deleting subscription',
    `Are you sure you want to delete the subscription '${subscriptionName}' under topic '${topicName}'?`,
    'delete',
    'cancel',
  );

  if (result) {
    await managementClient.removeSubscription(connectionId, topicName, subscriptionName);
  }

  refreshUtil.refreshSubscriptions(connectionId, topicName);
});
