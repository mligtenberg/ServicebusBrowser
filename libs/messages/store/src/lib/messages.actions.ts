import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { MessageFilter, ServiceBusMessage, ServiceBusReceivedMessage, SendMessagePage, BatchResendPage, Action } from '@service-bus-browser/messages-contracts';

export const peekMessages = createAction(
  '[Messages] peek messages',
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

export const peekMessagesLoadingDone = createAction(
  '[Messages] peek messages finished loading',
  props<{
    pageId: UUID,
    endpoint: ReceiveEndpoint,
  }>()
)

export const clearEndpoint = createAction(
  '[Messages] clear endpoint',
  props<{
    endpoint: ReceiveEndpoint,
    messagesToClearCount: number
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

export const importMessages = createAction(
  '[Messages] import messages'
)

export const setBatchResendMessages = createAction(
  '[Messages] set batch resend messages',
  props<{
    messages: ServiceBusReceivedMessage[]
  }>()
)

export const setPageFilter = createAction(
  '[Messages] set page filter',
  props<{
    pageId: UUID,
    filter: MessageFilter
  }>()
);

// Send Message Page actions
export const openSendMessagePage = createAction(
  '[Messages] open send message page',
  props<{
    pageId: UUID,
    name: string,
    sourcePageId?: string,
    sourceMessageId?: string
  }>()
);

export const updateSendMessagePage = createAction(
  '[Messages] update send message page',
  props<{
    pageId: UUID,
    formState: SendMessagePage['formState']
  }>()
);

export const closeSendMessagePage = createAction(
  '[Messages] close send message page',
  props<{
    pageId: UUID
  }>()
);

// Batch Resend Page actions
export const openBatchResendPage = createAction(
  '[Messages] open batch resend page',
  props<{
    pageId: UUID,
    name: string,
    messages: ServiceBusReceivedMessage[]
  }>()
);

export const updateBatchResendPage = createAction(
  '[Messages] update batch resend page',
  props<{
    pageId: UUID,
    actions?: Action[],
    selectedEndpoint?: SendEndpoint | null
  }>()
);

export const closeBatchResendPage = createAction(
  '[Messages] close batch resend page',
  props<{
    pageId: UUID
  }>()
);
