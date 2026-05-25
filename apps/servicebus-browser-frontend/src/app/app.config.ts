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
import { providePrimeNG } from 'primeng/config';
import { theme } from './theme';
import { provideLogsState } from '@service-bus-browser/logs-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTopologyState } from '@service-bus-browser/topology-store';
import { provideServiceBusElectronClient } from '@service-bus-browser/service-bus-angular-providers';
import { MessageService } from 'primeng/api';
import { provideTasksState } from '@service-bus-browser/tasks-store';
import { provideMessagesState } from '@service-bus-browser/messages-store';
import { provideRouterStore } from '@ngrx/router-store';
import { provideHttpClient } from '@angular/common/http';
import { provideMainUi } from '@service-bus-browser/main-ui';
import { provideMonacoConfig } from '@service-bus-browser/shared-components';
import { DialogService } from 'primeng/dynamicdialog';
import { WorkspaceService } from '@service-bus-browser/services';
import { initializeWorkspace, migrateOpfsFiles, getMessagesRepository } from '@service-bus-browser/messages-db';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

export const appConfig: ApplicationConfig = {
  providers: [
    // primeng
    providePrimeNG({
      theme: {
        preset: theme,
        options: {
          darkModeSelector: '.darkMode',
        },
      },
    }),
    {
      provide: DialogService,
      useClass: DialogService,
    },
    {
      provide: MessageService,
      useClass: MessageService,
    },

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

    // workspace initialization — must complete before NgRx effects start
    provideAppInitializer(async () => {
      const workspaceService = inject(WorkspaceService);
      const workspacesClient = inject(WorkspacesFrontendClient);

      const workspace = await workspacesClient.getActiveWorkspace();
      if (!workspace) {
        throw new Error('No active workspace returned by the backend');
      }

      // Run OPFS migration BEFORE initializeWorkspace so no DB is open yet
      // when we move files. The migration scans the OPFS directory directly.
      try {
        await migrateOpfsFiles(workspace.id);
      } catch (err) {
        console.warn('OPFS migration failed; will retry on next boot:', err);
      }

      workspaceService.initialize(workspace);
      initializeWorkspace(workspace.id);

      // Force the repository chain to fully resolve before the initializer
      // returns. Every file that does `getMessagesRepository().then(r => repository = r)`
      // at module load is awaiting on the same cached promise, so all of those
      // module-level `repository` bindings are assigned before NgRx effects run.
      await getMessagesRepository();
    }),
  ],
};
