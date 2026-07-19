import { Route } from '@angular/router';
import { AboutComponent, HomeComponent } from '@service-bus-browser/main-ui';

export const appRoutes: Route[] = [
  {
    path: 'popups',
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
        data: { title: 'About' },
      },
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
      },
    ],
  },
];
