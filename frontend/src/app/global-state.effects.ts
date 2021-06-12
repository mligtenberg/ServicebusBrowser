import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as actions from './ngrx/actions';
import {delay, map } from 'rxjs/operators';

@Injectable()
export class GlobalStateEffects {
  constructor(private actions$: Actions) {}

  $onTaskFinish = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.finishTask),
      delay(100),
      map((a) => actions.finishTaskComplete({
        id: a.id
      }))
    );
  });
}
