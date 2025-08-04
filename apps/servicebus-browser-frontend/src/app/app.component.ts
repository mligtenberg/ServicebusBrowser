import { Component, computed, effect, inject, signal } from '@angular/core';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { ColorThemeService } from '@service-bus-browser/services';
import { MenuItem } from 'primeng/api';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';
import { TopologyActions } from '@service-bus-browser/topology-store';

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
  };
}

@Component({
  imports: [
    MainUiComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = this.electron?.platform === 'darwin';

  store = inject(Store);

  fullscreen = signal<boolean>(false);
  windowControlSpacing = computed(() => this.isMac && !this.fullscreen());

  themeService = inject(ColorThemeService);
  darkMode = this.themeService.darkMode;

  menuItems: MenuItem[] = [
    {
      label: 'Connections',
      items: [
        {
          label: 'Add Connection',
          icon: 'pi pi-plus',
          routerLink: '/connections/add',
        },
      ],
    },
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
          label: 'Search for Updates',
          icon: 'pi pi-refresh',
          command: () => this.electron?.checkForUpdates?.(),
        },
        {
          label: 'About',
          icon: 'pi pi-info-circle',
          routerLink: '/about',
        },
      ],
    },
  ];

  constructor() {
    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
    this.electron?.onFullScreenChanged?.((full) => {
      this.fullscreen.set(full);
    });
    this.store.dispatch(TopologyActions.loadNamespaces());
  }

  importMessages(): void {
    this.store.dispatch(MessagesActions.importMessages());
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
