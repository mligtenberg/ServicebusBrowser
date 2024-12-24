import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { theme } from './theme';
import { provideLogsState } from '@service-bus-browser/logs-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTopologyState } from '@service-bus-browser/topology-store';
import { provideServiceBusClient } from '@service-bus-browser/service-bus-angular-providers';

export const appConfig: ApplicationConfig = {
  providers: [
    // primeng
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: theme,
        options: {
          darkModeSelector: false,
        }
      }
    }),

    // config
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withHashLocation()),
    provideLogsState(),
    provideTopologyState(),
    provideServiceBusClient(),

    // ngrx
    provideStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
