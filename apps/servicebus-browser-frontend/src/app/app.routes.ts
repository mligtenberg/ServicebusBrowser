import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'connections',
    loadChildren: () => import('@service-bus-browser/connections-flow').then(m => m.routes)
  },
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
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
  },
  {
    path: '',
    redirectTo: 'connections',
    pathMatch: 'full'
  }
];
