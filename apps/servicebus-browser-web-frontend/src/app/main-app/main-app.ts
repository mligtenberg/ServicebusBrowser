import { Component, computed, inject } from '@angular/core';

import { Button } from 'primeng/button';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { ColorThemeService } from '@service-bus-browser/services';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Component({
  selector: 'app-main-app',
  imports: [Button, MainUiComponent, Menu],
  templateUrl: './main-app.html',
  styleUrl: './main-app.scss',
})
export class MainApp {
  private authService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private themeService = inject(ColorThemeService);

  protected title = 'Service Bus Browser';
  private readonly store = inject(Store);
  activeAccount = toSignal(this.msalBroadcastService.msalSubject$.pipe(
    map(() => this.authService.instance.getActiveAccount()),
    startWith(this.authService.instance.getActiveAccount())
  ));
  userName = computed(() => this.activeAccount()?.name);

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
      ]
    },
  ];

  accountMenuItems: MenuItem[] = [
    {
      label: 'Sign-out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.signOut();
      },
    }
  ];

  constructor() {
    this.store.dispatch(TopologyActions.loadNamespaces());
  }

  importMessages(): void {
    this.store.dispatch(MessagesActions.importMessages());
  }

  signOut(): void {
    this.authService.logout();
  }
}
