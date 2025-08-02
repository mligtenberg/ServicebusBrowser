import { EnvironmentProviders, Provider } from '@angular/core';
import {
  ServiceBusManagementFrontendClient,
  ServiceBusMessagesFrontendClient,
  ServiceBusApiHandler
} from '@service-bus-browser/service-bus-electron-client';
import { WebServiceBusApiHandler } from './web-service-bus-api-handler';

export function provideServiceBusElectronClient(): (
  | Provider
  | EnvironmentProviders
  )[] {
  interface ElectronWindow {
    serviceBusApi: ServiceBusApiHandler
  }

  const typelessWindow = window as unknown;
  const { serviceBusApi } = typelessWindow as ElectronWindow;


  return [
    {
      provide: ServiceBusManagementFrontendClient,
      useFactory: () => new ServiceBusManagementFrontendClient(serviceBusApi)
    },
    {
      provide: ServiceBusMessagesFrontendClient,
      useFactory: () => new ServiceBusMessagesFrontendClient(serviceBusApi)
    }
  ];
}

export function provideServiceBusWebClient(baseAddress: string): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    {
      provide: ServiceBusManagementFrontendClient,
      useFactory: () => new ServiceBusManagementFrontendClient(
        new WebServiceBusApiHandler(baseAddress),
      )
    },
    {
      provide: ServiceBusMessagesFrontendClient,
      useFactory: () => new ServiceBusMessagesFrontendClient(
        new WebServiceBusApiHandler(baseAddress),
      )
    }
  ];
}
