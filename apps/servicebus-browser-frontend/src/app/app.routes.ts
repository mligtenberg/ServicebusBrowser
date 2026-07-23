import { Route } from '@angular/router';
import { AboutComponent, HomeComponent } from '@service-bus-browser/main-ui';
import {
  popupWorkspaceActivationGuard,
  rootWorkspaceRedirectGuard,
  workspaceActivationGuard,
} from './workspace-route.guard';

export const appRoutes: Route[] = [
  {
    path: 'popups',
    canActivate: [popupWorkspaceActivationGuard],
    loadComponent: () =>
      import('./dialog-shell/dialog-shell').then((m) => m.DialogShell),
    children: [
      {
        path: 'messages',
        loadChildren: () =>
          import('@service-bus-browser/messages-flow').then((m) => m.popups),
      },
      {
        path: 'connections',
        loadChildren: () =>
          import('@service-bus-browser/connections-flow').then((m) => m.popups),
      },
      {
        path: 'workspaces',
        children: [
          {
            path: 'add',
            loadComponent: () =>
              import('./popups/workspace-popup/workspace-popup').then(
                (m) => m.WorkspacePopupComponent,
              ),
            data: { popup: true },
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./popups/workspace-popup/workspace-popup').then(
                (m) => m.WorkspacePopupComponent,
              ),
            data: { popup: true },
          },
        ],
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./main-shell/main-shell').then((m) => m.MainShell),
    children: [
      {
        path: 'about',
        component: AboutComponent,
        data: { title: 'About' },
      },
      {
        path: ':workspaceId',
        canActivate: [workspaceActivationGuard],
        runGuardsAndResolvers: 'paramsChange',
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
            path: '',
            component: HomeComponent,
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
];
