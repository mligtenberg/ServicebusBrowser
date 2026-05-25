import { EnvironmentProviders, inject, Provider } from '@angular/core';
import {
  ManagementFrontendClient,
  MessagesFrontendClient,
  BackendApi,
  ServiceBusManagementFrontendClient,
  WorkspacesFrontendClient,
} from '@service-bus-browser/service-bus-frontend-clients';
import { WebBackendApi } from './web-backend-api';
import { HttpClient } from '@angular/common/http';

export function provideServiceBusElectronClient(): (
  | Provider
  | EnvironmentProviders
)[] {
  interface ElectronWindow {
    backendApi: BackendApi;
  }

  const { backendApi } = window as unknown as ElectronWindow;

  return [
    {
      provide: ManagementFrontendClient,
      useFactory: () => new ManagementFrontendClient(backendApi),
    },
    {
      provide: MessagesFrontendClient,
      useFactory: () => new MessagesFrontendClient(backendApi),
    },
    {
      provide: ServiceBusManagementFrontendClient,
      useFactory: () => new ServiceBusManagementFrontendClient(backendApi),
    },
    {
      provide: WorkspacesFrontendClient,
      useFactory: () => new WorkspacesFrontendClient(backendApi),
    },
  ];
}

export function provideServiceBusWebClient(
  baseAddress: string,
): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: WebBackendApi,
      useFactory: () => new WebBackendApi(baseAddress, inject(HttpClient)),
    },
    {
      provide: ManagementFrontendClient,
      useClass: ManagementFrontendClient,
      deps: [WebBackendApi],
    },
    {
      provide: MessagesFrontendClient,
      useClass: MessagesFrontendClient,
      deps: [WebBackendApi],
    },
    {
      provide: ServiceBusManagementFrontendClient,
      useClass: ServiceBusManagementFrontendClient,
      deps: [WebBackendApi],
    },
    {
      provide: WorkspacesFrontendClient,
      useClass: WorkspacesFrontendClient,
      deps: [WebBackendApi],
    },
  ];
}
