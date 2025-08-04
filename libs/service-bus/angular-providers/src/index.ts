import { EnvironmentProviders, inject, Provider } from '@angular/core';
import {
  ServiceBusManagementFrontendClient,
  ServiceBusMessagesFrontendClient,
  ServiceBusApiHandler,
} from '@service-bus-browser/service-bus-frontend-clients';
import { WebServiceBusApiHandler } from './web-service-bus-api-handler';
import { HttpClient } from '@angular/common/http';

export function provideServiceBusElectronClient(): (
  | Provider
  | EnvironmentProviders
)[] {
  interface ElectronWindow {
    serviceBusApi: ServiceBusApiHandler;
  }

  const typelessWindow = window as unknown;
  const { serviceBusApi } = typelessWindow as ElectronWindow;

  return [
    {
      provide: ServiceBusManagementFrontendClient,
      useFactory: () => new ServiceBusManagementFrontendClient(serviceBusApi),
    },
    {
      provide: ServiceBusMessagesFrontendClient,
      useFactory: () => new ServiceBusMessagesFrontendClient(serviceBusApi),
    },
  ];
}

export function provideServiceBusWebClient(
  baseAddress: string
): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: WebServiceBusApiHandler,
      useFactory: () =>
        new WebServiceBusApiHandler(baseAddress, inject(HttpClient)),
    },
    {
      provide: ServiceBusManagementFrontendClient,
      useClass: ServiceBusManagementFrontendClient,
      deps: [WebServiceBusApiHandler]
    },
    {
      provide: ServiceBusMessagesFrontendClient,
      useClass: ServiceBusMessagesFrontendClient,
      deps: [WebServiceBusApiHandler]
    },
  ];
}
