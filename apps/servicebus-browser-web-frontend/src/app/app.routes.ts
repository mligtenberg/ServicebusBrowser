import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'manage-topology',
    loadChildren: () => import('@service-bus-browser/manage-topology-flow').then(m => m.routes)
  },
  {
    path: 'messages',
    loadChildren: () => import('@service-bus-browser/messages-flow').then(m => m.routes({
      baseRoute: 'messages'
    }))
  },
  {
    path: '',
    redirectTo: 'connections',
    pathMatch: 'full'
  }
];
