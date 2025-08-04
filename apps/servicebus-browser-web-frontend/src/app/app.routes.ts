import { Route } from '@angular/router';
import { AboutComponent } from '@service-bus-browser/main-ui';
import { MsalGuard } from '@azure/msal-angular';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [MsalGuard],
    loadComponent: () => import('./main-app/main-app').then(m => m.MainApp),
    children: [
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
        component: AboutComponent
      }
    ]
  },
  {
    path: 'login-failed',
    loadComponent: () => import('./login-failed/login-failed').then(m => m.LoginFailed)
  }
];
