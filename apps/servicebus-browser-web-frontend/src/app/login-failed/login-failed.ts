import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { MsalBroadcastService } from '@azure/msal-angular';
import { catchError, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-login-failed',
  imports: [CommonModule, Card, RouterLink, ButtonDirective],
  templateUrl: './login-failed.html',
  styleUrl: './login-failed.scss',
})
export class LoginFailed {
  msalBroadcastService = inject(MsalBroadcastService);
  public error$ = this.msalBroadcastService.msalSubject$.pipe(
    map((x) => x.error),
    catchError(() => [undefined])
  );
  public error = toSignal(this.error$);
}
