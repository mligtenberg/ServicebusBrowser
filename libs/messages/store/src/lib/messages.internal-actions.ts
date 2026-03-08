import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  ServiceBusMessage,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';

export const pageCreated = createAction(
  '[Messages] page created',
  props<{
    pageId: UUID;
    pageName: string;
    loadedFromDb: boolean;
  }>(),
);

export const loadMessagesLoad = createAction(
  '[Messages] load peek messages-operations',
  props<{
    pageId: UUID;
    endpoint: ReceiveEndpoint;
    maxAmount: number;
    alreadyLoadedAmount: number;
    fromSequenceNumber: string;
    receiveType: 'peek' | 'receive';
  }>(),
);

export const loadMessagesPartLoaded = createAction(
  '[Messages] load messages-operations partially loaded',
  props<{
    pageId: UUID;
    endpoint: ReceiveEndpoint;
    maxAmount: number;
    amountLoaded: number;
    messages: ServiceBusReceivedMessage[];
    receiveType: 'peek' | 'receive';
  }>(),
);

export const continueClearingEndpoint = createAction(
  '[Messages] continue clearing endpoint',
  props<{
    endpoint: ReceiveEndpoint;
    messagesToClearCount: number;
    lastClearRoundReceivedMessagesCount?: number;
  }>(),
);

export const sentMessage = createAction(
  '[Messages] message sended',
  props<{
    endpoint: SendEndpoint;
    message: ServiceBusMessage;
  }>(),
);

export const messageSendFailed = createAction(
  '[Messages] message send failed',
  props<{
    endpoint: SendEndpoint;
    message: ServiceBusMessage;
  }>(),
);

export const messagesSendSucceeded = createAction(
  '[Messages] message send succeeded',
  props<{
    taskId: UUID;
  }>(),
);

export const messagesSending = createAction(
  '[Messages] message sending',
  props<{
    taskId: UUID;
    endpoint: SendEndpoint;
    messagesToSend: ServiceBusMessage[];
    sendAmount: number;
  }>(),
);

export const messagesSendFailed = createAction(
  '[Messages] message send failed',
  props<{
    taskId: UUID;
    endpoint: SendEndpoint;
    messagesToSend: ServiceBusMessage[];
    sendAmount: number;
  }>(),
);

export const messagesExported = createAction(
  '[Messages] messages-operations exported',
  props<{
    pageId: UUID;
  }>(),
);

export const messagesExportFailed = createAction(
  '[Messages] messages-operations export failed',
  props<{
    error: Error;
  }>(),
);

export const messagesImported = createAction(
  '[Messages] messages-operations imported',
  props<{
    pageId: UUID;
    pageName: string;
  }>(),
);

export const messagesImportFailed = createAction(
  '[Messages] messages-operations import failed',
);

export const loadPagesFromDb = createAction('[Messages] load pages from db');

export const updatePageName = createAction(
  '[Messages] update page name',
  props<{
    pageId: UUID;
    pageName: string;
  }>(),
);

export const batchSendCompleted = createAction(
  '[Messages] batch messages-operations send completed',
  props<{
    transactionId: UUID;
    endpoint: SendEndpoint;
  }>(),
);
