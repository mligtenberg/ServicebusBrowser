import { inject, Injectable } from '@angular/core';
import {
  messagePagesEffectActions,
} from '@service-bus-browser/messages-store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouterEffects {
  actions = inject(Actions);
  router = inject(Router);

  navigateTo$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(messagePagesEffectActions.pageLoaded, messagePagesEffectActions.pageLoadCancelled),
        switchMap(({ pageId }) =>
          from(this.router.navigate(['messages', 'page', pageId])),
        ),
      ),
    { dispatch: false },
  );
}
