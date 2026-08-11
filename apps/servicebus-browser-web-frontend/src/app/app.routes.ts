import { Route } from '@angular/router';
import { AboutComponent } from '@service-bus-browser/main-ui';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { OidcCallback } from './oidc-callback/oidc-callback';
import {
  popupWorkspaceActivationGuard,
  rootWorkspaceRedirectGuard,
  workspaceActivationGuard,
} from './workspace-route.guard';

export const appRoutes: Route[] = [
  {
    path: 'popups',
    canActivate: [AutoLoginPartialRoutesGuard, popupWorkspaceActivationGuard],
    loadComponent: () =>
      import('./dialog-shell/dialog-shell').then((m) => m.DialogShell),
    children: [
      {
        path: 'messages',
        loadChildren: () =>
          import('@service-bus-browser/messages-flow').then((m) => m.popups),
      },
    ],
  },
  {
    path: '',
    canActivate: [AutoLoginPartialRoutesGuard],
    children: [
      {
        path: ':workspaceId',
        canActivate: [workspaceActivationGuard],
        loadComponent: () =>
          import('./main-app/main-app').then((m) => m.MainApp),
        runGuardsAndResolvers: 'paramsChange',
        children: [
          {
            path: 'about',
            component: AboutComponent,
          },
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
            path: '',
            loadComponent: () =>
              import('./home-page/home-page').then((m) => m.HomePage),
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        canActivate: [rootWorkspaceRedirectGuard],
        children: [],
      },
    ],
  },
  {
    path: 'oidc-callback',
    component: OidcCallback,
  },
  {
    path: 'login-failed',
    loadComponent: () =>
      import('./login-failed/login-failed').then((m) => m.LoginFailed),
  },
];
