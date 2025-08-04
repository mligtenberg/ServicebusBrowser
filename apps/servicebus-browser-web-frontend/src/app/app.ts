import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { filter } from 'rxjs';
import { InteractionStatus, } from '@azure/msal-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private authService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private themeService = inject(ColorThemeService);
  darkMode = this.themeService.darkMode;
  initialized = signal<boolean>(false);

  constructor() {
    this.authService.handleRedirectObservable().subscribe(() => {
      this.initialized.set(true);
    });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });

    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
  }

  checkAndSetActiveAccount(){
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
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
