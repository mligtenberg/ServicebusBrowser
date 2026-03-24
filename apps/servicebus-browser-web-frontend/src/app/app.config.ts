import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
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
import { provideAuth, authInterceptor } from 'angular-auth-oidc-client';
import { ClientConfigStsLoader } from './auth-config';
import { provideMonacoConfig } from '@service-bus-browser/shared-components';
import { DialogService } from 'primeng/dynamicdialog';

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
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(
      appRoutes,
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

    // oidc auth
    provideAuth({
      loader: ClientConfigStsLoader,
    }),
  ],
};
