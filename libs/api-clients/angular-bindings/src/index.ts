import { EnvironmentProviders, inject, Provider } from '@angular/core';
import {
  ManagementFrontendClient,
  MessagesFrontendClient,
  ApiHandler,
  ServiceBusManagementFrontendClient,
  WorkspacesFrontendClient,
  WorkspacesApiHandler,
} from '@service-bus-browser/service-bus-frontend-clients';
import { WebServiceBusApiHandler } from './web-service-bus-api-handler';
import { LocalStorageWorkspacesApiHandler } from './local-storage-workspaces-api-handler';
import { HttpClient } from '@angular/common/http';

export function provideServiceBusElectronClient(): (
  | Provider
  | EnvironmentProviders
)[] {
  interface ElectronWindow {
    serviceBusApi: ApiHandler;
    workspacesApi: WorkspacesApiHandler;
  }

  const typelessWindow = window as unknown;
  const { serviceBusApi, workspacesApi } = typelessWindow as ElectronWindow;

  return [
    {
      provide: ManagementFrontendClient,
      useFactory: () => new ManagementFrontendClient(serviceBusApi),
    },
    {
      provide: MessagesFrontendClient,
      useFactory: () => new MessagesFrontendClient(serviceBusApi),
    },
    {
      provide: ServiceBusManagementFrontendClient,
      useFactory: () => new ServiceBusManagementFrontendClient(serviceBusApi),
    },
    {
      provide: WorkspacesFrontendClient,
      useFactory: () => new WorkspacesFrontendClient(workspacesApi),
    },
  ];
}

export function provideServiceBusWebClient(
  baseAddress: string,
): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: WebServiceBusApiHandler,
      useFactory: () =>
        new WebServiceBusApiHandler(baseAddress, inject(HttpClient)),
    },
    {
      provide: ManagementFrontendClient,
      useClass: ManagementFrontendClient,
      deps: [WebServiceBusApiHandler],
    },
    {
      provide: MessagesFrontendClient,
      useClass: MessagesFrontendClient,
      deps: [WebServiceBusApiHandler],
    },
    {
      provide: ServiceBusManagementFrontendClient,
      useClass: ServiceBusManagementFrontendClient,
      deps: [WebServiceBusApiHandler],
    },
    {
      provide: LocalStorageWorkspacesApiHandler,
      useClass: LocalStorageWorkspacesApiHandler,
    },
    {
      provide: WorkspacesFrontendClient,
      useClass: WorkspacesFrontendClient,
      deps: [LocalStorageWorkspacesApiHandler],
    },
  ];
}
