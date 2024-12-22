import { createFeature, createReducer, on } from '@ngrx/store';
import { Namespace, Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';

export const featureKey = 'topology';

export type TopologyState = {
  namespaces: Namespace[];
  queuesPerNamespace: Record<string, Queue[]>;
  topicsPerNamespace: Record<string, Topic[]>;
  subscriptionsPerNamespaceAndTopic: Record<string, Record<string, Subscription[]>>;
}

export const initialState: TopologyState = {
  namespaces: [
    {
      name: 'test-namespace',
      id: 'test-namespace-id',
    }
  ],
  queuesPerNamespace: {
    "test-namespace-id": [
      {
        name: 'test-queue',
        id: 'test-queue-id',
        messageCount: 10,
        deadLetterMessageCount: 0,
        transferDeadLetterMessageCount: 0
      }
    ]
  },
  topicsPerNamespace: {
    "test-namespace-id": [
      {
        name: 'test-topic',
        id: 'test-topic-id'
      }
    ]
  },
  subscriptionsPerNamespaceAndTopic: {
    "test-namespace-id": {
      "test-topic-id": [{
        name: 'test-subscription',
        id: 'test-subscription-id',
        messageCount: 20,
        deadLetterMessageCount: 0,
        transferDeadLetterMessageCount: 0
      }]
    }
  }
};

export const logsReducer = createReducer(
  initialState,
);

export const topologyFeature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
