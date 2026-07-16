import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withPreloading,
  PreloadAllModules, withRouterConfig,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideLogsState } from '@service-bus-browser/logs-store';
import { provideStore, Store } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTopologyState } from '@service-bus-browser/topology-store';
import { provideServiceBusElectronClient } from '@service-bus-browser/service-bus-angular-providers';

import { provideTasksState } from '@service-bus-browser/tasks-store';
import { provideMessagesState } from '@service-bus-browser/messages-store';
import { provideRouterStore } from '@ngrx/router-store';
import { provideHttpClient } from '@angular/common/http';
import { provideMainUi, pagesActions } from '@service-bus-browser/main-ui';
import { provideMonacoConfig } from '@service-bus-browser/shared-components';

import { WorkspaceService } from '@service-bus-browser/services';
import { initializeWorkspace, migrateOpfsFiles, getMessagesRepository } from '@service-bus-browser/messages-db';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

export const appConfig: ApplicationConfig = {
  providers: [


    // config
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(
      appRoutes,
      withHashLocation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
    ),
    provideLogsState(),
    provideTasksState(),
    provideMessagesState(),
    provideTopologyState(),
    provideServiceBusElectronClient(),
    provideMainUi(),

    // monaco
    provideMonacoConfig({
      urlPrefix: '/assets/monaco',
    }),

    // ngrx
    provideStore(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),

    // workspace initialization — NgRx effects register when the injector is
    // created, so anything that depends on the active workspace must be
    // triggered explicitly (via workspaceActivated) once it is known.
    provideAppInitializer(async () => {
      const workspaceService = inject(WorkspaceService);
      const workspacesClient = inject(WorkspacesFrontendClient);
      const store = inject(Store);

      const workspaces = await workspacesClient.listWorkspaces();
      const workspace = workspaceService.initialize(workspaces);
      store.dispatch(pagesActions.workspaceActivated({ workspaceId: workspace.id }));

      // Run OPFS migration BEFORE initializeWorkspace so no DB is open yet
      // when we move files. The migration scans the OPFS directory directly.
      try {
        await migrateOpfsFiles(workspace.id);
      } catch (err) {
        console.warn('OPFS migration failed; will retry on next boot:', err);
      }

      initializeWorkspace(workspace.id);

      // Force the repository chain to fully resolve before the initializer
      // returns. Every file that does `getMessagesRepository().then(r => repository = r)`
      // at module load is awaiting on the same cached promise, so all of those
      // module-level `repository` bindings are assigned before NgRx effects run.
      await getMessagesRepository();
    }),
  ],
};
