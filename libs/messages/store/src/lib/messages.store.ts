import { createFeature, createReducer, on } from '@ngrx/store';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export const featureKey = 'messages';

export type MessagesState = {
  receivedMessages: Array<{
    id: UUID;
    name: string;
    retrievedAt: Date;
    messages: ServiceBusReceivedMessage[]
  }>;
}

export const initialState: MessagesState = {
  receivedMessages: [{
      id: crypto.randomUUID(),
    retrievedAt: new Date(),
    name: 'queue1 (0 results)',
    messages: []
  }]
};

export const logsReducer = createReducer(
  initialState,
);

export const feature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
