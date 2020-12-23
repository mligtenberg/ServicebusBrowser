import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ConnectionEffects } from './connection.effects';

describe('ConnectionEffects', () => {
  let actions$: Observable<any>;
  let effects: ConnectionEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConnectionEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ConnectionEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
