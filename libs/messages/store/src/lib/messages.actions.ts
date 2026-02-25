import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint, SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { MessageFilter, ServiceBusMessage } from '@service-bus-browser/messages-contracts';

export const loadMessages = createAction(
  '[Messages] load messages',
  props<{
    endpoint: ReceiveEndpoint,
    maxAmount: number,
    fromSequenceNumber?: string,
    receiveType: 'peek' | 'receive'
  }>()
)

export const closePage = createAction(
  '[Messages] close page',
  props<{
    pageId: UUID,
  }>()
)

export const loadMessagesLoadingDone = createAction(
  '[Messages] peek messages finished loading',
  props<{
    pageId: UUID,
    endpoint: ReceiveEndpoint,
    receiveType: 'peek' | 'receive'
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

export const sendPartialBatch = createAction(
  '[Messages] send partial batch',
  props<{
    transactionId: UUID;
    endpoint: SendEndpoint;
    messages: ServiceBusMessage[];
    alreadySentAmount: number;
    totalAmount: number;
    lastBatch: boolean;
  }>(),
);

export const exportMessages = createAction(
  '[Messages] export messages',
  props<{
    pageId: UUID,
    filter?: MessageFilter,
    selection?: string[],
  }>()
)

export const importMessages = createAction(
  '[Messages] import messages'
)


export const setPageFilter = createAction(
  '[Messages] set page filter',
  props<{
    pageId: UUID,
    filter: MessageFilter
  }>()
);

export const setPageSelection = createAction(
  '[Messages] set page selection',
  props<{
    pageId: UUID;
    sequenceNumbers: string[] | undefined;
  }>(),
);
