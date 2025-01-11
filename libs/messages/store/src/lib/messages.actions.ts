import { createAction, props } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';

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
