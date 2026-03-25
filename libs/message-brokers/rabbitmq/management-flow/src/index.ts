import { Routes } from '@angular/router';
import './lib/action-handlers';

export const routes: Routes = [
  {
    path: 'connections/:connectionId/vhosts/:vhostName/queues/add',
    loadComponent: () =>
      import('./lib/queue-management/queue-management.component').then(
        (m) => m.QueueManagementComponent,
      ),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/vhosts/:vhostName/queues/edit/:queueName',
    loadComponent: () =>
      import('./lib/queue-management/queue-management.component').then(
        (m) => m.QueueManagementComponent,
      ),
    data: {
      action: 'modify',
    },
  },
  {
    path: 'connections/:connectionId/vhosts/:vhostName/exchanges/add',
    loadComponent: () =>
      import('./lib/exchange-management/exchange-management.component').then(
        (m) => m.ExchangeManagementComponent,
      ),
    data: {
      action: 'create',
    },
  },
  {
    path: 'connections/:connectionId/vhosts/:vhostName/exchanges/edit/:exchangeName',
    loadComponent: () =>
      import('./lib/exchange-management/exchange-management.component').then(
        (m) => m.ExchangeManagementComponent,
      ),
    data: {
      action: 'modify',
    },
  },
];
