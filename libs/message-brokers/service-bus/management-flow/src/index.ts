import { Router, Routes } from '@angular/router';
import { provideActionHandler } from '@service-bus-browser/actions-framework';
import { inject } from '@angular/core';

export const routes: Routes = [
  {
    path: 'connections/:connectionId/queues/add',
    loadComponent: () =>
      import('./lib/queue-management/queue-management.component').then(
        (m) => m.QueueManagementComponent,
      ),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/queues/edit/:queueId',
    loadComponent: () =>
      import('./lib/queue-management/queue-management.component').then(
        (m) => m.QueueManagementComponent,
      ),
    data: {
      action: 'modify',
    },
  },
  {
    path: 'connections/:connectionId/topics/add',
    loadComponent: () =>
      import('./lib/topic-management/topic-management.component').then(
        (m) => m.TopicManagementComponent,
      ),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/topics/edit/:topicId',
    loadComponent: () =>
      import('./lib/topic-management/topic-management.component').then(
        (m) => m.TopicManagementComponent,
      ),
    data: {
      action: 'modify',
    },
  },
  {
    path: 'connections/:connectionId/topics/:topicId/subscriptions/add',
    loadComponent: () =>
      import(
        './lib/subscription-management/subscription-management.component'
      ).then((m) => m.SubscriptionManagementComponent),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/topics/:topicId/subscriptions/edit/:subscriptionId',
    loadComponent: () =>
      import(
        './lib/subscription-management/subscription-management.component'
      ).then((m) => m.SubscriptionManagementComponent),
    data: {
      action: 'modify',
    },
  },
  {
    path: 'connections/:connectionId/topics/:topicId/subscriptions/:subscriptionId/rules/add',
    loadComponent: () =>
      import(
        './lib/subscription-rule-management/subscription-rule-management.component'
      ).then((m) => m.SubscriptionRuleManagementComponent),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/topics/:topicId/subscriptions/:subscriptionId/rules/edit/:ruleName',
    loadComponent: () =>
      import(
        './lib/subscription-rule-management/subscription-rule-management.component'
      ).then((m) => m.SubscriptionRuleManagementComponent),
    data: {
      action: 'modify',
    },
  },
];

provideActionHandler('service-bus:queue:add', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'queues',
    'add'
  ]);
});
provideActionHandler('service-bus:queue:edit', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'queues',
    'edit',
    action.parameters['queueName'],
  ]);
});

provideActionHandler('service-bus:topic:add', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    'add'
  ]);
});
provideActionHandler('service-bus:topic:edit', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    'edit',
    action.parameters['topicName'],
  ]);
});

provideActionHandler('service-bus:subscription:add', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    'add',
  ])
})
provideActionHandler('service-bus:subscription:edit', (action) => {
  const router = inject(Router);
  return router.navigate([
    'manage-service-bus',
    'connections',
    action.parameters['connectionId'],
    'topics',
    action.parameters['topicName'],
    'subscriptions',
    'edit',
    action.parameters['subscriptionName'],
  ])
});

provideActionHandler('service-bus:subscription-rule:add', (action) => {
  const router = inject(Router);
  return router.navigate([
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
})
provideActionHandler('service-bus:subscription-rule:edit', (action) => {
  const router = inject(Router);
  return router.navigate([
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
