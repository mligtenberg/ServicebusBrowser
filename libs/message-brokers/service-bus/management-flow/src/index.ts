import { Routes } from '@angular/router';
import './lib/action-handlers';

export const routes: Routes = [
  {
    path: 'connections/:connectionId/queues/add',
    loadComponent: () =>
      import('./lib/queue-management/queue-management.component').then(
        (m) => m.QueueManagementComponent,
      ),
    data: {
      action: 'create',
      title: 'Add Queue',
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
      title: (params: Record<string, string>) => `Edit Queue: ${params['queueId']}`,
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
      title: 'Add Topic',
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
      title: (params: Record<string, string>) => `Edit Topic: ${params['topicId']}`,
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
      title: 'Add Subscription',
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
      title: (params: Record<string, string>) => `Edit Subscription: ${params['subscriptionId']}`,
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
      title: 'Add Rule',
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
      title: (params: Record<string, string>) => `Edit Rule: ${params['ruleName']}`,
    },
  },
];
