import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
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
  MonacoEditorModule,
  NgxMonacoEditorConfig,
} from 'ngx-monaco-editor-v2';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideMainUi } from '@service-bus-browser/main-ui';
import { MSALInstanceFactory, MSALGuardConfigFactory, MSALInterceptorConfigFactory } from './msal-config';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalService,
} from '@azure/msal-angular';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'assets',
  requireConfig: { preferScriptTags: true },
};

export const appConfig: ApplicationConfig = {
  providers: [
    // primeng
    provideAnimationsAsync(),
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

    // config
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(
      appRoutes,
      withPreloading(PreloadAllModules)
    ),
    provideLogsState(),
    provideTasksState(),
    provideMessagesState(),
    provideTopologyState(),
    provideServiceBusWebClient("/api/"),
    provideMainUi(),

    // monaco
    importProvidersFrom([MonacoEditorModule.forRoot(monacoConfig)]),

    // ngrx
    provideStore(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),

    //msal
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
};
