import { logsReducer, initialState } from './messages.store';
import * as Actions from './messages.actions';
import * as InternalActions from './messages.internal-actions';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import { randomUUID } from 'crypto';

const connectionId: UUID = '00000000-0000-0000-0000-000000000001';
const endpoint: ReceiveEndpoint = {
  connectionId,
  queueName: 'test-queue',
  channel: undefined
};

const pageId: UUID = '11111111-1111-1111-1111-111111111111';

const loadAction = (id: UUID = pageId) =>
  InternalActions.peekMessagesLoad({
    pageId: id,
    endpoint,
    maxAmount: 10,
    alreadyLoadedAmount: 0,
    fromSequenceNumber: '0'
  });

const partLoadedAction = (id: UUID = pageId, messages: ServiceBusReceivedMessage[]) =>
  InternalActions.peekMessagesPartLoaded({
    pageId: id,
    endpoint,
    maxAmount: 10,
    amountLoaded: messages.length,
    messages
  });

describe('messages store reducer', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID },
      configurable: true
    });
  });
  it('creates a new page when loading messages', () => {
    const state = logsReducer(initialState, loadAction());
    expect(state.receivedMessages.length).toBe(1);
    expect(state.receivedMessages[0]).toMatchObject({
      id: pageId,
      name: 'test-queue (loading...)',
      loaded: false,
      messages: []
    });
  });

  it('does not duplicate existing page', () => {
    const withPage = logsReducer(initialState, loadAction());
    const state = logsReducer(withPage, loadAction());
    expect(state.receivedMessages.length).toBe(1);
  });

  it('appends messages when part loaded', () => {
    let state = logsReducer(initialState, loadAction());
    const msgs: ServiceBusReceivedMessage[] = [
      { body: 'a', sequenceNumber: '1', state: 'active' },
      { body: 'b', sequenceNumber: '2', state: 'active' }
    ];
    state = logsReducer(state, partLoadedAction(pageId, msgs));
    expect(state.receivedMessages[0].messages.length).toBe(2);
  });

  it('marks page loaded and sets name range', () => {
    let state = logsReducer(initialState, loadAction());
    const msgs: ServiceBusReceivedMessage[] = [
      { body: 'a', sequenceNumber: '1', state: 'active' },
      { body: 'b', sequenceNumber: '2', state: 'active' }
    ];
    state = logsReducer(state, partLoadedAction(pageId, msgs));
    state = logsReducer(state, Actions.peekMessagesLoadingDone({ pageId, endpoint }));
    expect(state.receivedMessages[0].loaded).toBe(true);
    expect(state.receivedMessages[0].name).toBe('test-queue (1 - 2)');
  });

  it('removes page when closed', () => {
    let state = logsReducer(initialState, loadAction());
    state = logsReducer(state, Actions.closePage({ pageId }));
    expect(state.receivedMessages.length).toBe(0);
  });

  it('adds page for imported messages', () => {
    const msgs: ServiceBusReceivedMessage[] = [{ body: 'a', sequenceNumber: '1', state: 'active' }];
    const state = logsReducer(initialState, InternalActions.messagesImported({ pageName: 'file', messages: msgs }));
    expect(state.receivedMessages.length).toBe(1);
    expect(state.receivedMessages[0].name).toBe('Imported: file');
    expect(state.receivedMessages[0].loaded).toBe(true);
    expect(state.receivedMessages[0].messages).toEqual(msgs);
  });

  it('sets batch resend messages', () => {
    const msgs: ServiceBusReceivedMessage[] = [{ body: 'a', sequenceNumber: '1', state: 'active' }];
    const state = logsReducer(initialState, Actions.setBatchResendMessages({ messages: msgs }));
    expect(state.messageForBatchResend).toEqual(msgs);
  });
});
