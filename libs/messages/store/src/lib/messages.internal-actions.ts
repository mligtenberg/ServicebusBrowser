import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';

export const peakMessagesLoad = createAction(
  '[Messages] load peak messages',
  props<{
    pageId: UUID,
    endpoint: ReceiveEndpoint,
    maxAmount: number,
    alreadyLoadedAmount: number,
    fromSequenceNumber: string
  }>()
)

export const peakMessagesPartLoaded = createAction(
  '[Messages] peak messages partially loaded',
  props<{
    pageId: UUID,
    endpoint: ReceiveEndpoint,
    maxAmount: number,
    amountLoaded: number,
    messages: ServiceBusReceivedMessage[]
  }>()
)

export const continueClearingEndpoint = createAction(
  '[Messages] continue clearing endpoint',
  props<{
    endpoint: ReceiveEndpoint
  }>()
)
