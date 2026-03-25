import { Route } from '@angular/router';
import { AboutComponent } from '@service-bus-browser/main-ui';

export const appRoutes: Route[] = [
  {
    path: 'connections',
    loadChildren: () => import('@service-bus-browser/connections-flow').then(m => m.routes)
  },
  {
    path: 'manage-service-bus',
    loadChildren: () => import('@service-bus-browser/service-bus-management-flow').then(m => m.routes)
  },
  {
    path: 'manage-rabbitmq',
    loadChildren: () => import('@service-bus-browser/rabbitmq-management-flow').then(m => m.routes)
  },
  {
    path: 'messages',
    loadChildren: () => import('@service-bus-browser/messages-flow').then(m => m.routes({
      baseRoute: 'messages'
    }))
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '',
    redirectTo: 'connections',
    pathMatch: 'full'
  }
];
