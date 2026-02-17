import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withPreloading,
  PreloadAllModules,
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
      provide: MessageService,
      useClass: MessageService,
    },
    provideMonacoConfig({
      urlPrefix: '/assets/monaco'
    }),

    // config
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(
      appRoutes,
      withHashLocation(),
      withPreloading(PreloadAllModules)
    ),
    provideLogsState(),
    provideTasksState(),
    provideMessagesState(),
    provideTopologyState(),
    provideServiceBusElectronClient(),
    provideMainUi(),

    // ngrx
    provideStore(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
