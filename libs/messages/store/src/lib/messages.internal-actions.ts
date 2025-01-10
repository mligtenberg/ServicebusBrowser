import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { MessageChannels } from '@service-bus-browser/service-bus-contracts';

export const peakMessagesLoad = createAction(
  '[Messages] load peak messages',
  props<{
    connectionId: UUID,
    pageId: UUID,
    endpoint: {
      queueName: string,
      channel: MessageChannels
    } | {
      topicName: string,
      subscriptionName: string,
      channel: MessageChannels
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
      channel: MessageChannels
    } | {
      topicName: string,
      subscriptionName: string,
      channel: MessageChannels
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
      channel: MessageChannels
    } | {
      topicName: string,
      subscriptionName: string,
      channel: MessageChannels
    },
  }>()
)
