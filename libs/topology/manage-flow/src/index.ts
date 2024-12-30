import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'namespaces/:namespaceId/queues/:queueId',
    loadComponent: () => import('./lib/queue-management/queue-management.component').then(m => m.QueueManagementComponent)
  },
  {
    path: 'namespaces/:namespaceId/topics/:topicId',
    loadComponent: () => import('./lib/topic-management/topic-management.component').then(m => m.TopicManagementComponent)
  }
]