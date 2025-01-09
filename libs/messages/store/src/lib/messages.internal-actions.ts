import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';

export const peakMessagesLoad = createAction(
  '[Messages] load peak queue messages',
  props<{
    connectionId: UUID,
    pageId: UUID,
    endpoint: {
      queueName: string,
    } | {
      topicName: string,
      subscriptionName: string,
    },
    maxAmount: number,
    fromSequenceNumber: string
  }>()
)

export const peakMessagesPartLoaded = createAction(
  '[Messages] peak messages partially loaded',
  props<{
    connectionId: UUID,
    pageId: UUID,
    endpoint: {
      queueName: string,
    } | {
      topicName: string,
      subscriptionName: string,
    },
    maxAmount: number,
    amountLoaded: number,
    messages: ServiceBusReceivedMessage[]
  }>()
)

export const peakMessagesLoadingDone = createAction(
  '[Messages] peak messages finished loading',
  props<{
    connectionId: UUID,
    pageId: UUID,
    endpoint: {
      queueName: string,
    } | {
      topicName: string,
      subscriptionName: string,
    },
  }>()
)
