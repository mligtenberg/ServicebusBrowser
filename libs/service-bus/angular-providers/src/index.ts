import { EnvironmentProviders, Provider } from '@angular/core';
import {
  ServiceBusManagementElectronClient,
  ServiceBusMessagesElectronClient
} from '@service-bus-browser/service-bus-electron-client';

export function provideServiceBusClient(): (
  | Provider
  | EnvironmentProviders
  )[] {
  return [
    {
      provide: ServiceBusManagementElectronClient,
      useClass: ServiceBusManagementElectronClient
    },
    {
      provide: ServiceBusMessagesElectronClient,
      useClass: ServiceBusMessagesElectronClient
    }
  ];
}
