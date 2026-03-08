import { EnvironmentProviders, inject, Provider } from '@angular/core';
import {
  ManagementFrontendClient,
  MessagesFrontendClient,
  ApiHandler,
  ServiceBusManagementFrontendClient,
} from '@service-bus-browser/service-bus-frontend-clients';
import { WebServiceBusApiHandler } from './web-service-bus-api-handler';
import { HttpClient } from '@angular/common/http';

export function provideServiceBusElectronClient(): (
  | Provider
  | EnvironmentProviders
)[] {
  interface ElectronWindow {
    serviceBusApi: ApiHandler;
  }

  const typelessWindow = window as unknown;
  const { serviceBusApi } = typelessWindow as ElectronWindow;

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
    }
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
    }
  ];
}
