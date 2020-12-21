import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ServicebusConnectionEffects } from './servicebus-connection.effects';

describe('ServicebusConnectionEffects', () => {
  let actions$: Observable<any>;
  let effects: ServicebusConnectionEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServicebusConnectionEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ServicebusConnectionEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
