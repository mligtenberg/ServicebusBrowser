import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';

export const peakMessages = createAction(
  '[Messages] peak messages',
  props<{
    connectionId: UUID,
    endpoint: {
      queueName: string,
    } | {
      topicName: string,
      subscriptionName: string,
    },
    maxAmount: number,
  }>()
)
