import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { MainEffectsEffects } from './main-effects.effects';

describe('MainEffectsEffects', () => {
  let actions$: Observable<any>;
  let effects: MainEffectsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MainEffectsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(MainEffectsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
