import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SubscriptionsEffects } from './subscriptions.effects';

describe('SubscriptionsEffects', () => {
  let actions$: Observable<any>;
  let effects: SubscriptionsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubscriptionsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SubscriptionsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
