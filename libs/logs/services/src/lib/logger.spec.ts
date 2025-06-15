import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Logger } from './logger';
import { LogsActions } from '@service-bus-browser/logs-store';

describe('Logger', () => {
  let store: MockStore;
  let logger: Logger;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Logger, provideMockStore({})]
    });
    store = TestBed.inject(MockStore);
    logger = TestBed.inject(Logger);
  });

  it('dispatches writeLog action', () => {
    const spy = jest.spyOn(store, 'dispatch');
    logger.info('hello');
    expect(spy).toHaveBeenCalledWith(LogsActions.writeLog({ message: 'hello', severity: 'info', context: undefined }));
  });
});
