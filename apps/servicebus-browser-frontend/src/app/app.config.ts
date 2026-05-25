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
import { initializeWorkspace, migrateOpfsFiles } from '@service-bus-browser/messages-db';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';

interface ElectronWindow {
  electron?: {
    getActiveWorkspace?: () => Promise<Workspace>;
  };
}

async function resolveWorkspace(): Promise<Workspace> {
  const electronWorkspace = await (window as unknown as ElectronWindow).electron?.getActiveWorkspace?.();
  if (electronWorkspace) {
    return electronWorkspace;
  }

  // Web fallback: use a stable workspace id stored in localStorage
  const stored = localStorage.getItem('sbb-workspace');
  if (stored) {
    return JSON.parse(stored) as Workspace;
  }

  const workspace: Workspace = {
    id: crypto.randomUUID() as UUID,
    name: 'Default',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('sbb-workspace', JSON.stringify(workspace));
  return workspace;
}

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
      const workspace = await resolveWorkspace();

      // Run OPFS migration BEFORE initializeWorkspace so no DB is open yet
      // when we move files. The migration scans the OPFS directory directly.
      try {
        await migrateOpfsFiles(workspace.id);
      } catch (err) {
        console.warn('OPFS migration failed; will retry on next boot:', err);
      }

      workspaceService.initialize(workspace);
      initializeWorkspace(workspace.id);
    }),
  ],
};
