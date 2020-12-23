import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { QueuesEffects } from './queues.effects';

describe('QueuesEffects', () => {
  let actions$: Observable<any>;
  let effects: QueuesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueuesEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(QueuesEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
