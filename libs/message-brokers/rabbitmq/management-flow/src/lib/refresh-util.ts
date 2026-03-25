import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Injectable({
  providedIn: 'root',
})
export class RefreshUtil {
  store = inject(Store);

  public refreshQueues(connectionId: string, vhostName: string) {
    const encodedVHost = encodeURIComponent(vhostName);
    this.store.dispatch(
      TopologyActions.refreshTopology({
        path: `/${connectionId}/vhosts/${encodedVHost}/queues`,
      }),
    );
  }

  public refreshExchanges(connectionId: string, vhostName: string) {
    const encodedVHost = encodeURIComponent(vhostName);
    this.store.dispatch(
      TopologyActions.refreshTopology({
        path: `/${connectionId}/vhosts/${encodedVHost}/exchanges`,
      }),
    );
  }
}
