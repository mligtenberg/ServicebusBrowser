import { Component, inject } from '@angular/core';
import { SbbCard, SbbButton } from '@service-bus-browser/shared-ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-login-failed',
  imports: [SbbCard, RouterLink, SbbButton],
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
