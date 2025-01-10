import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageChannels } from '@service-bus-browser/service-bus-contracts';

export const peakMessages = createAction(
  '[Messages] peak messages',
  props<{
    endpoint: {
      connectionId: UUID,
      queueName: string,
      channel: MessageChannels,
    } | {
      connectionId: UUID,
      topicName: string,
      subscriptionName: string,
      channel: MessageChannels,
    },
    maxAmount: number,
    fromSequenceNumber?: string
  }>()
)

export const closePage = createAction(
  '[Messages] close page',
  props<{
    pageId: UUID,
  }>()
)
