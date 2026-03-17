import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { TopologyAction } from '@service-bus-browser/api-contracts';

export const actionHandlers: Record<
  string,
  (action: TopologyAction) => void | Promise<void>
> = {};

@Injectable({
  providedIn: 'root',
})
export class ActionManager {
  injector = inject(EnvironmentInjector);

  async handleAction(action: TopologyAction) {
    const handler = actionHandlers[action.actionType];
    if (handler) {
      await runInInjectionContext(this.injector, async () => {
        await handler(action);
      });
    } else {
      console.warn(`No handler for action type ${action.actionType}`);
    }
  }
}
