import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'connections',
    loadChildren: () => import('@service-bus-browser/connections-flow').then(m => m.connectionsRoutes)
  },
  {
    path: '',
    redirectTo: 'connections',
    pathMatch: 'full'
  }
];
