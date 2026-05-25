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
import { provideServiceBusWebClient } from '@service-bus-browser/service-bus-angular-providers';
import { MessageService } from 'primeng/api';
import { provideTasksState } from '@service-bus-browser/tasks-store';
import { provideMessagesState } from '@service-bus-browser/messages-store';
import { provideRouterStore } from '@ngrx/router-store';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideMainUi } from '@service-bus-browser/main-ui';
import {
  provideAuth,
  authInterceptor,
  StsConfigLoader, withAppInitializerAuthCheck,
} from 'angular-auth-oidc-client';
import { ClientConfigStsLoader } from './auth-config';
import { provideMonacoConfig } from '@service-bus-browser/shared-components';
import { DialogService } from 'primeng/dynamicdialog';
import { WorkspaceService } from '@service-bus-browser/services';
import { initializeWorkspace, migrateOpfsFiles, getMessagesRepository } from '@service-bus-browser/messages-db';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';

async function resolveWorkspace(): Promise<Workspace> {
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
    // workspace initialization — must complete before NgRx effects start
    provideAppInitializer(async () => {
      const workspaceService = inject(WorkspaceService);
      const workspace = await resolveWorkspace();
      try {
        await migrateOpfsFiles(workspace.id);
      } catch (err) {
        console.warn('OPFS migration failed; will retry on next boot:', err);
      }
      workspaceService.initialize(workspace);
      initializeWorkspace(workspace.id);
      // Force module-level `repository` bindings (set via getMessagesRepository().then(...))
      // to be assigned before NgRx effects run.
      await getMessagesRepository();
    }),

    // oidc auth
    provideAuth(
      {
        loader: {
          provide: StsConfigLoader,
          useFactory: () => new ClientConfigStsLoader(),
        },
      },
      withAppInitializerAuthCheck(),
    ),

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
    provideHttpClient(withInterceptors([authInterceptor()])),
    provideRouter(
      appRoutes,
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
    provideServiceBusWebClient('/api/'),
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
  ],
};
