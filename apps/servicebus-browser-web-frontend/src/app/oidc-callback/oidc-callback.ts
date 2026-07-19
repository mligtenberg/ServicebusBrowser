import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oidc-callback',
  imports: [],
  templateUrl: './oidc-callback.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './oidc-callback.scss',
})
export class OidcCallback implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams['error']) {
      this.router.navigate(['/login-failed'], { queryParams: this.activatedRoute.snapshot.queryParams });
    }
  }
}
