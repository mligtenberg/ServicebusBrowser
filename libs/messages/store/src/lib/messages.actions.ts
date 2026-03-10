import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  Message,
  ReceiveEndpoint,
  ReceiveOptions,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { MessageModificationAction } from '@service-bus-browser/message-modification-engine';
import { MessageFilter } from '@service-bus-browser/filtering';

export const messagesActions = createActionGroup({
  source: 'messages',
  events: {
    'load messages from endpoint': props<{
      endpoint: ReceiveEndpoint;
      options: ReceiveOptions;
    }>(),
    'start import messages': emptyProps(),
    'clear endpoint': props<{
      endpoint: ReceiveEndpoint;
    }>(),
    'send message': props<{
      endpoint: SendEndpoint;
      message: Message;
    }>(),
  },
});

export const messagePagesActions = createActionGroup({
  source: 'message pages',
  events: {
    'set page filter': props<{
      pageId: UUID;
      filter: MessageFilter;
    }>(),
    'set page selection': props<{
      pageId: UUID;
      selectionKeys: string[];
    }>(),
    'rename page': props<{
      pageId: UUID;
      pageName: string;
    }>(),
    'close page': props<{
      pageId: UUID;
    }>(),
    'export messages': props<{
      pageId: UUID;
      filter?: MessageFilter;
      selectionKeys?: string[];
    }>(),
    'Resend messages': props<{
      endpoint: SendEndpoint;
      pageId: UUID;
      messageFilter?: MessageFilter;
      selectionKeys?: string[];
      modificationActions: MessageModificationAction[];
    }>(),
  },
});
