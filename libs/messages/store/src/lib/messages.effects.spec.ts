import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { MessagesEffects } from './messages.effects';
import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import { ServiceBusMessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import {
  ReceiveEndpoint,
  SendEndpoint,
} from '@service-bus-browser/service-bus-contracts';
const endpoint: ReceiveEndpoint & SendEndpoint = {
  connectionId: '00000000-0000-0000-0000-000000000001',
  queueName: 'test-queue',
  channel: undefined as any,
  endpoint: '',
  endpointDisplay: '',
};
const message = { body: 'a' } as any;
describe('MessagesEffects', () => {
  let actions$: ReplaySubject<any>;
  let effects: MessagesEffects;
  let service: {
    sendMessage: jest.Mock;
  };
  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: () => '00000000-0000-0000-0000-000000000002' },
      configurable: true,
    });
    service = { sendMessage: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        MessagesEffects,
        provideMockStore({}),
        { provide: ServiceBusMessagesFrontendClient, useValue: service },
        provideMockActions(() => actions$),
      ],
    });
    effects = TestBed.inject(MessagesEffects);
  });
  it('loads peek messages', async () => {
    actions$ = new ReplaySubject(1);
    actions$.next(actions.peekMessages({ endpoint, maxAmount: 5 }));
    const result = await firstValueFrom(effects.loadPeekQueueMessages$);
    expect(result).toEqual(
      internalActions.peekMessagesLoad({
        pageId: '00000000-0000-0000-0000-000000000002',
        endpoint,
        maxAmount: 5,
        alreadyLoadedAmount: 0,
        fromSequenceNumber: '0',
      })
    );
  });
  it('emits send success', async () => {
    service.sendMessage.mockResolvedValue(undefined);
    actions$ = new ReplaySubject(1);
    actions$.next(actions.sendMessage({ endpoint, message }));
    const result = await firstValueFrom(effects.sendMessage$);
    expect(result).toEqual(
      internalActions.sentMessage({ endpoint, message })
    );
  });
  it('emits send failed', async () => {
    service.sendMessage.mockRejectedValue(new Error('fail'));
    actions$ = new ReplaySubject(1);
    actions$.next(actions.sendMessage({ endpoint, message }));
    const result = await firstValueFrom(effects.sendMessage$);
    expect(result).toEqual(
      internalActions.messageSendFailed({ endpoint, message })
    );
  });
});
