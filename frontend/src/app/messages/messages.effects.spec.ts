import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { MessagesEffects } from './messages.effects';

describe('MessagesEffects', () => {
  let actions$: Observable<any>;
  let effects: MessagesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagesEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(MessagesEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
