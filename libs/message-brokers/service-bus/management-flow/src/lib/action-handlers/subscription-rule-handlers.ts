import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

provideActionHandler('service-bus:subscription-rule:add', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    action.parameters['subscriptionName'],
    'rules',
    'add',
  ]);
});

provideActionHandler('service-bus:subscription-rule:edit', async (action) => {
  const router = inject(Router);
  await router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    action.parameters['subscriptionName'],
    'rules',
    'edit',
    action.parameters['ruleName'],
  ]);
});

provideActionHandler('service-bus:subscription-rule:delete', async (action) => {
  const confirmationService = inject(ConfirmationService);
  const managementClient = inject(ServiceBusManagementFrontendClient);
  const refreshUtil = inject(RefreshUtil);

  const connectionId = action.parameters['connectionId'];
  const topicName = action.parameters['topicName'];
  const subscriptionName = action.parameters['subscriptionName'];
  const ruleName = action.parameters['ruleName'];

  if (
    !connectionId ||
    !topicName ||
    !subscriptionName ||
    !ruleName ||
    typeof connectionId !== 'string' ||
    typeof topicName !== 'string' ||
    typeof subscriptionName !== 'string' ||
    typeof ruleName !== 'string'
  ) {
    throw new Error('Connection ID, topic name, subscription name, and rule name are required parameters');
  }

  const result = await confirmationService.confirm(
    'Deleting rule',
    `Are you sure you want to delete the rule '${ruleName}' under subscription '${subscriptionName}'?`,
    'delete',
    'cancel',
  );

  if (result) {
    await managementClient.removeSubscriptionRule(connectionId, topicName, subscriptionName, ruleName);
  }

  refreshUtil.refreshTopics(connectionId);
});
