import { Component, computed, inject } from '@angular/core';

import { Button } from 'primeng/button';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ColorThemeService } from '@service-bus-browser/services';
import { messagesActions } from '@service-bus-browser/messages-store';

@Component({
  selector: 'app-main-app',
  imports: [Button, MainUiComponent, Menu],
  templateUrl: './main-app.html',
  styleUrl: './main-app.scss',
})
export class MainApp {
  private oidcSecurityService = inject(OidcSecurityService);
  private themeService = inject(ColorThemeService);

  protected title = 'Service Bus Browser';
  private readonly store = inject(Store);

  userData = toSignal(
    this.oidcSecurityService.userData$.pipe(map((r) => r.userData)),
  );
  userName = computed(() => this.userData()?.name);

  menuItems: MenuItem[] = [
    {
      label: 'Messages',
      items: [
        {
          label: 'Send',
          icon: 'pi pi-send',
          routerLink: '/messages/send',
        },
        {
          label: 'Import',
          icon: 'pi pi-upload',
          command: () => {
            this.importMessages();
          },
        },
      ],
    },
    {
      label: 'Settings',
      items: [
        {
          label: 'Application Theme',
          icon: 'pi pi-desktop',
          items: [
            {
              label: 'Sync with OS',
              icon: 'pi pi-desktop',
              command: () => this.themeService.setPreference('sync'),
            },
            {
              label: 'Light theme',
              icon: 'pi pi-sun',
              command: () => this.themeService.setPreference('light'),
            },
            {
              label: 'Dark theme',
              icon: 'pi pi-moon',
              command: () => this.themeService.setPreference('dark'),
            },
          ],
        },
        {
          label: 'About',
          icon: 'pi pi-info-circle',
          routerLink: '/about',
        },
      ],
    },
  ];

  accountMenuItems: MenuItem[] = [
    {
      label: 'Sign-out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.signOut();
      },
    },
  ];

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }

  signOut(): void {
    this.oidcSecurityService.logoff().subscribe();
  }
}
