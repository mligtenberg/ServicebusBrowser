import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { theme } from './theme';
import { provideLogsState } from '@service-bus-browser/logs-store';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTopologyState } from '@service-bus-browser/topology-store';
import { provideServiceBusClient } from '@service-bus-browser/service-bus-angular-providers';
import { MessageService } from 'primeng/api';
import { provideTasksState } from '@service-bus-browser/tasks-store';
import { provideMessagesState } from '@service-bus-browser/messages-store';
import { provideRouterStore } from '@ngrx/router-store';
import { routeFeature } from './ngrx/route.store';
import { provideEffects } from '@ngrx/effects';
import { RouterEffects } from './ngrx/router.effects';
import { provideHighlightOptions } from 'ngx-highlightjs';

export const appConfig: ApplicationConfig = {
  providers: [
    // primeng
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: theme,
      }
    }),
    {
      provide: MessageService,
      useClass: MessageService
    },

    // highlight js
    provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js')
    }),

    // config
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes, withHashLocation()),
    provideLogsState(),
    provideTasksState(),
    provideMessagesState(),
    provideTopologyState(),
    provideServiceBusClient(),
    provideState(routeFeature),
    provideEffects([RouterEffects]),

    // ngrx
    provideStore(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
