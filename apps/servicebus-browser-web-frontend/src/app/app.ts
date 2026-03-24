import { Component, effect, inject, signal } from '@angular/core';
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
  private themeService = inject(ColorThemeService);
  darkMode = this.themeService.darkMode;
  initialized = signal<boolean>(false);

  constructor() {
    this.oidcSecurityService.checkAuth().subscribe({
      next: () => this.initialized.set(true),
      error: () => this.initialized.set(true),
    });

    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
  }

  setDarkMode(darkMode: boolean) {
    const element = document.querySelector('html');
    const darkModeSet = element?.classList.contains('darkMode');
    if (darkMode && !darkModeSet) {
      element?.classList.add('darkMode');
    }

    if (!darkMode && darkModeSet) {
      element?.classList.remove('darkMode');
    }
  }
}
