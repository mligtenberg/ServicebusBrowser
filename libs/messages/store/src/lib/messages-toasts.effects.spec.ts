import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject } from 'rxjs';
import { MessagesToastsEffects } from './messages-toasts.effects';
import * as internalActions from './messages.internal-actions';
import { MessageService } from 'primeng/api';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';

const endpoint: SendEndpoint = { connectionId: '00000000-0000-0000-0000-000000000001', queueName: 'q', endpoint: '', endpointDisplay: '' };

const message = { body: 'a' } as any;

describe('MessagesToastsEffects', () => {
  let actions$: ReplaySubject<any>;
  let effects: MessagesToastsEffects;
  let service: { add: jest.Mock };

  beforeEach(() => {
    service = { add: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        MessagesToastsEffects,
        { provide: MessageService, useValue: service },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(MessagesToastsEffects);
  });

  it('shows success toast', () => {
    actions$ = new ReplaySubject(1);
    actions$.next(internalActions.sendedMessage({ endpoint, message }));
    effects.showMessageSendSuccess$.subscribe();
    expect(service.add).toHaveBeenCalled();
  });

  it('shows error toast', () => {
    actions$ = new ReplaySubject(1);
    actions$.next(internalActions.messageSendFailed({ endpoint, message }));
    effects.showMessageSendFailed$.subscribe();
    expect(service.add).toHaveBeenCalled();
  });
});
