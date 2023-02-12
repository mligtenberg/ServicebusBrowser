import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { map } from 'rxjs/operators';

@Injectable()
export class MainEffectsEffects {
  constructor(
    private actions$: Actions,
    private router: Router
  ) {}

  init$ = createEffect(() => this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    map(() => this.router.navigate(['']))
  ), {dispatch: false});
}
