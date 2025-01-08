import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const peakSubscriptionMessages = createAction(
  '[Messages] peak subscription messages',
  props<{
    connectionId: UUID,
    topicName: string,
    subscriptionName: string,
    maxAmount: number,
  }>()
)

export const peakQueueMessages = createAction(
  '[Messages] peak queue messages',
  props<{
    connectionId: UUID,
    queueName: string,
    maxAmount: number,
  }>()
)
