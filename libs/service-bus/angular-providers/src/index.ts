import { EnvironmentProviders, Provider } from '@angular/core';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';

export function provideServiceBusClient(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    {
      provide: ServiceBusElectronClient,
      useClass: ServiceBusElectronClient
    }
  ];
}
