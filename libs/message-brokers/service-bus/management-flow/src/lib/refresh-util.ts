import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Injectable({
  providedIn: 'root',
})
export class RefreshUtil {
  store = inject(Store);

  public refreshQueues(connectionId: string) {
    this.store.dispatch(TopologyActions.refreshTopology({
      path: `/${connectionId}/queues`,
    }))
  }

  public refreshTopics(connectionId: string) {
    this.store.dispatch(TopologyActions.refreshTopology({
      path: `/${connectionId}/topics`,
    }))
  }

  public refreshSubscriptions(connectionId: string, topicName: string) {
    this.store.dispatch(TopologyActions.refreshTopology({
      path: `/${connectionId}/topics/${topicName}`,
    }))
  }

  public refreshSubscriptionRules(connectionId: string, topicName: string, subscriptionName: string) {
    this.store.dispatch(TopologyActions.refreshTopology({
      path: `/${connectionId}/topics/${topicName}/${subscriptionName}`,
    }))
  }
}
