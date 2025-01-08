import { EnvironmentProviders, Provider } from '@angular/core';
import { ServiceBusManagementElectronClient } from '@service-bus-browser/service-bus-electron-client';

export function provideServiceBusClient(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    {
      provide: ServiceBusManagementElectronClient,
      useClass: ServiceBusManagementElectronClient
    }
  ];
}
