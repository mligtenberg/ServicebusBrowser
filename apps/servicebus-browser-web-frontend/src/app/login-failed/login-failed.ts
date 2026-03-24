import { Component, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { map } from 'rxjs';

@Component({
  selector: 'app-login-failed',
  imports: [Card, RouterLink, ButtonDirective],
  templateUrl: './login-failed.html',
  styleUrl: './login-failed.scss',
})
export class LoginFailed {
  private route = inject(ActivatedRoute);
  public error = toSignal(
    this.route.queryParams.pipe(
      map((params) => params['error_description'] ?? params['error'] ?? null),
    ),
  );
}
