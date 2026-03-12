import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';

export const messagesEffectActions = createActionGroup({
  source: 'Messages effects',
  events: {
    'message sent': props<{
      endpoint: SendEndpoint;
    }>(),
    'failed to send message': props<{
      endpoint: SendEndpoint;
      error: Error;
    }>(),
    'cleared endpoint': props<{
      endpoint: ReceiveEndpoint;
    }>(),
    'failed to clear messages': props<{
      endpoint: ReceiveEndpoint;
      error: Error;
    }>(),
  },
});

export const messagePagesEffectActions = createActionGroup({
  source: 'message pages effects',
  events: {
    'page created': props<{
      pageId: UUID;
      pageName: string;
      disabled: boolean;
    }>(),
    'page load cancelled': props<{
      pageId: UUID;
      endpoint: ReceiveEndpoint | null;
    }>(),
    'page loaded': props<{
      pageId: UUID;
      endpoint: ReceiveEndpoint | null;
    }>(),
    'messages resent': props<{
      endpoint: SendEndpoint;
    }>(),
    'load pages from db': emptyProps(),
    'page closed': props<{
      pageId: UUID;
    }>(),
  },
});
