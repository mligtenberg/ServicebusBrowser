import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    // primeng
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),

    // config
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withHashLocation()),
  ],
};
