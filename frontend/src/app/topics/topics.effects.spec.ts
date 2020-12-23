import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { TopicsEffects } from './topics.effects';

describe('TopicsEffects', () => {
  let actions$: Observable<any>;
  let effects: TopicsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TopicsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(TopicsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
