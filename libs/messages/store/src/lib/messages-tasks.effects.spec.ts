import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { MessagesTasksEffects } from './messages-tasks.effects';
import * as internalActions from './messages.internal-actions';
import { ReceiveEndpoint } from '@service-bus-browser/service-bus-contracts';
import { TasksActions } from '@service-bus-browser/tasks-store';
const endpoint: ReceiveEndpoint = {
  connectionId: '00000000-0000-0000-0000-000000000001',
  queueName: 'q',
  channel: undefined,
};
describe('MessagesTasksEffects', () => {
  let actions$: ReplaySubject<any>;
  let effects: MessagesTasksEffects;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesTasksEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(MessagesTasksEffects);
  });
  it('creates task on load', async () => {
    actions$ = new ReplaySubject(1);
    actions$.next(
      internalActions.peekMessagesLoad({
        pageId: '00000000-0000-0000-0000-000000000002',
        endpoint,
        maxAmount: 5,
        alreadyLoadedAmount: 0,
        fromSequenceNumber: '0',
      })
    );
    const result = await firstValueFrom(effects.createTask$);
    expect(result).toEqual(
      TasksActions.createTask({
        id: '00000000-0000-0000-0000-000000000002',
        statusDescription: '0/5',
        description: 'loading messages from q',
        hasProgress: true,
        initialProgress: 0,
      })
    );
  });
});
