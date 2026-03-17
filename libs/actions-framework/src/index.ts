import { EnvironmentProviders, Provider } from '@angular/core';
import { actionHandlers } from './lib/action-manager';
import { TopologyAction } from '@service-bus-browser/api-contracts';

export function provideActionHandler(actionType: string, handler: (action: TopologyAction) => void | Promise<void>): (Provider | EnvironmentProviders)[] {
  actionHandlers[actionType] = handler;
  return [];
}

export { ActionManager } from './lib/action-manager';

