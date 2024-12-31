import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'namespaces/:namespaceId/queues/create',
    loadComponent: () => import('./lib/queue-management/queue-management.component').then(m => m.QueueManagementComponent),
    data: {
      action: 'create'
    }
  },
  {
    path: 'namespaces/:namespaceId/queues/edit/:queueId',
    loadComponent: () => import('./lib/queue-management/queue-management.component').then(m => m.QueueManagementComponent),
    data: {
      action: 'modify'
    }
  },
  {
    path: 'namespaces/:namespaceId/topics/create',
    loadComponent: () => import('./lib/topic-management/topic-management.component').then(m => m.TopicManagementComponent),
    data: {
      action: 'create'
    }
  },
  {
    path: 'namespaces/:namespaceId/topics/edit/:topicId',
    loadComponent: () => import('./lib/topic-management/topic-management.component').then(m => m.TopicManagementComponent),
    data: {
      action: 'modify'
    }
  },
  {
    path: 'namespaces/:namespaceId/topics/:topicId/subscriptions/create',
    loadComponent: () => import('./lib/subscription-management/subscription-management.component').then(m => m.SubscriptionManagementComponent),
    data: {
      action: 'create'
    }
  },
  {
    path: 'namespaces/:namespaceId/topics/:topicId/subscriptions/edit/:subscriptionId',
    loadComponent: () => import('./lib/subscription-management/subscription-management.component').then(m => m.SubscriptionManagementComponent),
    data: {
      action: 'modify'
    }
  }
]
