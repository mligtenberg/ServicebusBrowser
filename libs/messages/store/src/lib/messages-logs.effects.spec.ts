import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';
import { MessagesLogsEffects } from './messages-logs.effects';
import { Logger } from '@service-bus-browser/logs-services';
import * as internalActions from './messages.internal-actions';
import * as actions from './messages.actions';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';

const endpoint: ReceiveEndpoint = { connectionId: '00000000-0000-0000-0000-000000000001', queueName: 'q', channel: undefined };

describe('MessagesLogsEffects', () => {
  let effects: MessagesLogsEffects;
  let actions$: ReplaySubject<any>;
  let logger: { info: jest.Mock, error: jest.Mock };

  beforeEach(() => {
    logger = { info: jest.fn(), error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        MessagesLogsEffects,
        provideMockStore({}),
        { provide: Logger, useValue: logger },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(MessagesLogsEffects);
  });

  it('logs progress', () => {
    actions$ = new ReplaySubject(1);
    actions$.next(internalActions.peekMessagesPartLoaded({ pageId: '00000000-0000-0000-0000-000000000002', endpoint, maxAmount: 5, amountLoaded: 1, messages: [] }));
    effects.logLoadingProgress$.subscribe();
    expect(logger.info).toHaveBeenCalled();
  });

  it('logs cleared', () => {
    actions$ = new ReplaySubject(1);
    actions$.next(actions.clearedEndpoint({ endpoint }));
    effects.logClearedEndpoint$.subscribe();
    expect(logger.info).toHaveBeenCalled();
  });
});
