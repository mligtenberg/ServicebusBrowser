import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private oidcSecurityService = inject(OidcSecurityService);
  // Eagerly instantiate so the service's dark-mode effect attaches to <html>.
  private themeService = inject(ColorThemeService);
  initialized = signal<boolean>(false);

  constructor() {
    this.oidcSecurityService.checkAuth().subscribe({
      next: () => this.initialized.set(true),
      error: () => this.initialized.set(true),
    });
  }
}
