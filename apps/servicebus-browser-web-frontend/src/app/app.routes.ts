import { Route } from '@angular/router';
import { AboutComponent } from '@service-bus-browser/main-ui';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { OidcCallback } from './oidc-callback/oidc-callback';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () => import('./main-app/main-app').then((m) => m.MainApp),
    children: [
      {
        path: 'manage-service-bus',
        loadChildren: () =>
          import('@service-bus-browser/service-bus-management-flow').then(
            (m) => m.routes,
          ),
      },
      {
        path: 'messages',
        loadChildren: () =>
          import('@service-bus-browser/messages-flow').then((m) =>
            m.routes({
              baseRoute: 'messages',
            }),
          ),
      },
      {
        path: 'about',
        component: AboutComponent,
      },
    ],
  },
  {
    path: 'oidc-callback',
    component: OidcCallback
  },
  {
    path: 'login-failed',
    loadComponent: () =>
      import('./login-failed/login-failed').then((m) => m.LoginFailed),
  },
];
