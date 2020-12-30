import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { map } from 'rxjs/operators';



@Injectable()
export class MainEffectsEffects {
  constructor(
    private actions$: Actions,
    private router: Router
  ) {}

  @Effect({dispatch: false})
  init$ = this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    map(() => this.router.navigate(['']))
  );
}
