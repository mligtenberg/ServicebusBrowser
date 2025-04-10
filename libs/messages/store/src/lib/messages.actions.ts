import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusMessage, ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';

export const peakMessages = createAction(
  '[Messages] peak messages',
  props<{
    endpoint: ReceiveEndpoint,
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

export const peakMessagesLoadingDone = createAction(
  '[Messages] peak messages finished loading',
  props<{
    pageId: UUID,
    endpoint: ReceiveEndpoint,
  }>()
)

export const clearEndpoint = createAction(
  '[Messages] clear endpoint',
  props<{
    endpoint: ReceiveEndpoint
  }>()
)

export const clearedEndpoint = createAction(
  '[Messages] cleared endpoint',
  props<{
    endpoint: ReceiveEndpoint
  }>()
)

export const sendMessage = createAction(
  '[Messages] send message',
  props<{
    endpoint: SendEndpoint,
    message: ServiceBusMessage
  }>()
)

export const sendMessages = createAction(
  '[Messages] send messages',
  props<{
    endpoint: SendEndpoint,
    messages: ServiceBusMessage[]
  }>()
)

export const exportMessages = createAction(
  '[Messages] export messages',
  props<{
    pageName: string,
    messages: ServiceBusReceivedMessage[]
  }>()
)
